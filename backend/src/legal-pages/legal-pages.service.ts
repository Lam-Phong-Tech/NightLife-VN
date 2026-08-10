import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { LegalPage, Prisma } from '@prisma/client';
import { AccessService, AuthenticatedUser } from '../access/access.service';
import { buildAdminAuditLog } from '../audit-logs/admin-audit';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateLegalPageDto } from './dto/update-legal-page.dto';
import {
  definitionForKey,
  definitionForSlug,
  LEGAL_PAGE_DEFINITIONS,
} from './legal-pages.constants';

type LegalSection = { heading: string; body: string };

const cleanText = (value: string, maxLength: number) =>
  value.trim().slice(0, maxLength);

const normalizeSections = (value: unknown): LegalSection[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
      const record = item as Record<string, unknown>;
      if (typeof record.heading !== 'string' || typeof record.body !== 'string')
        return null;
      const heading = cleanText(record.heading, 180);
      const body = cleanText(record.body, 30000);
      return heading && body ? { heading, body } : null;
    })
    .filter((item): item is LegalSection => Boolean(item));
};

@Injectable()
export class LegalPagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: AccessService,
  ) {}

  async listPublic() {
    const rows = await this.prisma.legalPage.findMany({
      where: {
        key: { in: [...LEGAL_PAGE_DEFINITIONS.map((item) => item.key)] },
      },
      select: this.publicSelect(),
    });
    const bySlug = new Map(rows.map((row) => [row.slug, row]));
    const data = LEGAL_PAGE_DEFINITIONS.map((definition) =>
      bySlug.get(definition.slug),
    )
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .map((row) => this.map(row));
    if (data.length !== LEGAL_PAGE_DEFINITIONS.length) {
      throw new ServiceUnavailableException('Legal pages are not initialized');
    }
    return { data };
  }

  async getPublic(slug: string) {
    const definition = definitionForSlug(slug.trim().toLowerCase());
    if (!definition) throw new NotFoundException('Legal page not found');
    const row = await this.prisma.legalPage.findUnique({
      where: { key: definition.key },
      select: this.publicSelect(),
    });
    if (!row) throw new NotFoundException('Legal page not found');
    return this.map(row);
  }

  async listAdmin(user: AuthenticatedUser) {
    const response = await this.listPublic();
    return {
      ...response,
      capabilities: {
        canUpdate: await this.accessService.canUpdateAdminLegalPages(user),
      },
    };
  }

  async update(user: AuthenticatedUser, key: string, dto: UpdateLegalPageDto) {
    const definition = definitionForKey(key.trim().toUpperCase());
    if (!definition) throw new BadRequestException('Invalid legal page key');

    const existing = await this.prisma.legalPage.findUnique({
      where: { key: definition.key },
    });
    if (!existing) throw new NotFoundException('Legal page not found');
    if (existing.version !== dto.expectedVersion) {
      throw new ConflictException(
        'Legal page was updated by another administrator',
      );
    }

    const nextSections = dto.sections
      ? normalizeSections(dto.sections)
      : normalizeSections(existing.sections);
    if (!nextSections.length)
      throw new BadRequestException('At least one legal section is required');

    const nextTitle =
      dto.title !== undefined ? cleanText(dto.title, 180) : existing.title;
    if (!nextTitle) throw new BadRequestException('Title is required');
    const data: Prisma.LegalPageUpdateInput = {
      ...(dto.title !== undefined ? { title: nextTitle } : {}),
      ...(dto.excerpt !== undefined
        ? { excerpt: cleanText(dto.excerpt, 320) || null }
        : {}),
      ...(dto.sections !== undefined ? { sections: nextSections } : {}),
      ...(dto.noindex !== undefined ? { noindex: dto.noindex } : {}),
      updatedById: user.id,
      version: { increment: 1 },
    };

    return this.prisma.$transaction(async (tx) => {
      const guarded = await tx.legalPage.updateMany({
        where: { id: existing.id, version: dto.expectedVersion },
        data,
      });
      if (guarded.count !== 1)
        throw new ConflictException(
          'Legal page was updated by another administrator',
        );

      const updated = await tx.legalPage.findUniqueOrThrow({
        where: { id: existing.id },
      });
      await tx.auditLog.create({
        data: buildAdminAuditLog({
          actor: user,
          module: 'LegalPages',
          action: 'legal_page.update',
          targetType: 'LegalPage',
          targetId: updated.id,
          entityDisplayCode: updated.slug,
          before: this.auditSnapshot(existing),
          after: this.auditSnapshot(updated),
          changeSummary: `Đã cập nhật trang pháp lý "${updated.title}"`,
        }),
      });
      return this.map(updated);
    });
  }

  private auditSnapshot(row: LegalPage) {
    return {
      key: row.key,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      sections: normalizeSections(row.sections),
      noindex: row.noindex,
      version: row.version,
    };
  }

  private publicSelect() {
    return {
      id: true,
      key: true,
      slug: true,
      title: true,
      excerpt: true,
      sections: true,
      noindex: true,
      version: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    } satisfies Prisma.LegalPageSelect;
  }

  private map(
    row: Pick<
      LegalPage,
      | 'id'
      | 'key'
      | 'slug'
      | 'title'
      | 'excerpt'
      | 'sections'
      | 'noindex'
      | 'version'
      | 'publishedAt'
      | 'createdAt'
      | 'updatedAt'
    >,
  ) {
    return {
      id: row.id,
      key: row.key,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      sections: normalizeSections(row.sections),
      noindex: row.noindex,
      version: row.version,
      publishedAt: row.publishedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
