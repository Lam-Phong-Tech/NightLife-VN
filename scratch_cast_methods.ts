
  // ==========================================
  // ADMIN CASTS
  // ==========================================

  async checkAdminCastSlug(slug: string) {
    const existing = await this.prisma.cast.findUnique({ where: { slug } });
    return { available: !existing };
  }

  async listAdminCasts(query: import('./dto/admin-store.dto').AdminStoreQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 50));
    const skip = (page - 1) * limit;

    const where: import('@prisma/client').Prisma.CastWhereInput = {
      deletedAt: null,
    };

    if (query.search) {
      const s = this.cleanText(query.search);
      where.OR = [
        { stageName: this.containsInsensitive(s) },
        { tags: { has: s } },
        { store: { name: this.containsInsensitive(s) } }
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.cast.count({ where }),
      this.prisma.cast.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          store: { select: { id: true, name: true } },
          media: { select: { id: true, url: true } }
        }
      })
    ]);

    return {
      data: items,
      total,
      page,
      limit,
    };
  }

  async createAdminCast(dto: import('./dto/admin-cast.dto').CreateAdminCastDto) {
    let slug = this.generateSlug(dto.stageName);
    let counter = 1;
    while (!(await this.checkAdminCastSlug(slug)).available) {
      slug = `${this.generateSlug(dto.stageName)}-${counter}`;
      counter++;
    }

    const newCast = await this.prisma.cast.create({
      data: {
        stageName: dto.stageName,
        slug,
        storeId: dto.storeId,
        publicHeadline: dto.publicHeadline,
        bio: dto.bio,
        birthMonth: dto.birthMonth,
        zodiacSign: dto.zodiacSign,
        heightCm: dto.heightCm,
        measurements: dto.measurements,
        languages: dto.languages || [],
        hobbies: dto.hobbies || [],
        tags: dto.tags || [],
        youtubeLinks: dto.youtubeLinks || [],
        isPublic: dto.isPublic !== undefined ? dto.isPublic : true,
        status: dto.status || 'DRAFT',
        ...(dto.mediaIds && dto.mediaIds.length > 0
          ? {
              media: {
                connect: dto.mediaIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
    });

    return newCast;
  }

  async updateAdminCast(id: string, dto: import('./dto/admin-cast.dto').UpdateAdminCastDto) {
    await this.prisma.cast.findUniqueOrThrow({ where: { id } });

    const updated = await this.prisma.cast.update({
      where: { id },
      data: {
        ...(dto.stageName && { stageName: dto.stageName }),
        ...(dto.storeId && { storeId: dto.storeId }),
        ...(dto.publicHeadline !== undefined && { publicHeadline: dto.publicHeadline }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.birthMonth !== undefined && { birthMonth: dto.birthMonth }),
        ...(dto.zodiacSign !== undefined && { zodiacSign: dto.zodiacSign }),
        ...(dto.heightCm !== undefined && { heightCm: dto.heightCm }),
        ...(dto.measurements !== undefined && { measurements: dto.measurements }),
        ...(dto.languages && { languages: dto.languages }),
        ...(dto.hobbies && { hobbies: dto.hobbies }),
        ...(dto.tags && { tags: dto.tags }),
        ...(dto.youtubeLinks && { youtubeLinks: dto.youtubeLinks }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
        ...(dto.status && { status: dto.status }),
        ...(dto.mediaIds
          ? {
              media: {
                set: [], // Clear existing relations
                connect: dto.mediaIds.map((id) => ({ id })), // Then connect new ones
              },
            }
          : {}),
      },
    });

    return updated;
  }
