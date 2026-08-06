import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuthenticatedUser } from '../access/access.service';
import { buildAdminAuditLog } from '../audit-logs/admin-audit';

const USER_ROLE_TO_ROLE_KEY: Record<string, string> = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  OPERATOR: 'operator',
  STAFF: 'staff',
  PARTNER: 'partner',
  USER: 'member',
};

// Roles that can never have their permissions modified via API
const IMMUTABLE_ROLES = new Set(['super_admin']);

@Injectable()
export class RbacService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async getMatrix() {
    // Query all roles (active, not deleted)
    const roles = await this.prisma.role.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      orderBy: { level: 'desc' },
      select: { id: true, key: true, name: true, level: true },
    });

    // Query all permissions
    const permissions = await this.prisma.permission.findMany({
      orderBy: { key: 'asc' },
      select: { id: true, key: true, name: true, description: true },
    });

    // Query all role-permission assignments
    const rolePermissions = await this.prisma.rolePermission.findMany({
      select: {
        role: { select: { key: true } },
        permission: { select: { key: true } },
      },
    });

    // Build assignments map: roleKey -> permissionKey[]
    const assignments: Record<string, string[]> = {};
    for (const rp of rolePermissions) {
      const roleKey = rp.role.key;
      if (!assignments[roleKey]) assignments[roleKey] = [];
      assignments[roleKey].push(rp.permission.key);
    }

    // version = count of all rolePermission rows
    const version = await this.prisma.rolePermission.count();

    return { roles, permissions, assignments, version };
  }

  async updateRolePermissions(
    actor: AuthenticatedUser,
    roleKey: string,
    permissionKeys: string[],
    version: number,
  ) {
    const actorRoleKey = USER_ROLE_TO_ROLE_KEY[actor.role ?? ''] ?? '';

    // SUPER_ADMIN cannot be changed by anyone
    if (IMMUTABLE_ROLES.has(roleKey)) {
      throw new ForbiddenException('Cannot modify super_admin permissions');
    }

    // Admin can only modify operator
    if (actorRoleKey === 'admin' && roleKey !== 'operator') {
      throw new ForbiddenException('Admin can only modify operator permissions');
    }

    // Operator and below cannot modify anyone
    if (actorRoleKey !== 'admin' && actorRoleKey !== 'super_admin') {
      throw new ForbiddenException('Insufficient privilege to modify role permissions');
    }

    // Check version (optimistic lock)
    const currentVersion = await this.prisma.rolePermission.count();
    if (currentVersion !== version) {
      throw new ConflictException(`Permission matrix has been modified by another admin. Please reload and try again.`);
    }

    // Find the target role
    const role = await this.prisma.role.findFirst({
      where: { key: roleKey, status: 'ACTIVE', deletedAt: null },
    });
    if (!role) {
      throw new BadRequestException(`Role '${roleKey}' not found`);
    }

    // Validate all permission keys exist
    const existingPermissions = await this.prisma.permission.findMany({
      where: { key: { in: permissionKeys } },
      select: { id: true, key: true },
    });
    if (existingPermissions.length !== permissionKeys.length) {
      const found = new Set(existingPermissions.map(p => p.key));
      const invalid = permissionKeys.filter(k => !found.has(k));
      throw new BadRequestException(`Unknown permission keys: ${invalid.join(', ')}`);
    }

    // Get current assignments for this role (for audit)
    const currentAssignments = await this.prisma.rolePermission.findMany({
      where: { roleId: role.id },
      select: { permission: { select: { key: true } } },
    });
    const beforeKeys = currentAssignments.map(a => a.permission.key);

    // Transaction: delete removed + create new
    const newPermissionIds = existingPermissions.map(p => p.id);
    await this.prisma.$transaction(async (tx) => {
      // Delete permissions no longer in the list
      await tx.rolePermission.deleteMany({
        where: {
          roleId: role.id,
          permissionId: { notIn: newPermissionIds },
        },
      });

      // Add new permissions (skip existing via upsert)
      for (const permission of existingPermissions) {
        await tx.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
          update: {},
          create: { roleId: role.id, permissionId: permission.id },
        });
      }

      // Write AuditLog
      await tx.auditLog.create({
        data: buildAdminAuditLog({
          actor,
          module: 'rbac',
          action: 'rbac.role.permissions.updated',
          targetType: 'Role',
          targetId: role.id,
          entityDisplayCode: roleKey,
          before: { permissions: beforeKeys },
          after: { permissions: permissionKeys },
          changeSummary: `Updated permissions for role '${roleKey}': ${permissionKeys.length} permissions set`,
          result: 'SUCCESS',
        }),
      });
    });

    const newVersion = await this.prisma.rolePermission.count();
    return { roleKey, permissionCount: permissionKeys.length, version: newVersion };
  }
}
