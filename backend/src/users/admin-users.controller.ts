import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('admin-users')
@Controller('admin/users')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminUsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  @ApiOperation({ summary: 'Tìm kiếm quán chưa có chủ/cho staff' })
  @Get('stores/search')
  async searchStores(
    @Query('q') q?: string,
    @Query('forRole') forRole?: string
  ) {
    const where: any = { deletedAt: null };
    
    if (q) {
      where.name = { contains: q, mode: 'insensitive' };
    }

    if (forRole === 'partner' || forRole === 'PARTNER') {
      where.ownerId = null; // Quán chưa có chủ
    }

    const stores = await this.prisma.store.findMany({
      where,
      select: {
        id: true,
        name: true,
        address: true,
        ownerId: true,
      },
      take: 20,
    });
    
    return stores;
  }

  @ApiOperation({ summary: 'Lấy danh sách tài khoản' })
  @Get()
  listUsers(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return this.usersService.listUsers({ skip, take, search, role, status });
  }

  @ApiOperation({ summary: 'Tạo tài khoản mới' })
  @Post()
  createUser(
    @Body() dto: {
      email: string;
      password?: string;
      displayName?: string;
      role?: 'USER' | 'PARTNER' | 'OPERATOR' | 'STAFF' | 'ADMIN';
      storeId?: string;
    }
  ) {
    return this.usersService.createUser({
      email: dto.email,
      password: dto.password || '12345678aA@',
      displayName: dto.displayName,
      role: dto.role,
      storeId: dto.storeId,
    });
  }

  @ApiOperation({ summary: 'Cập nhật tài khoản' })
  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Body() dto: { displayName: string; email: string }
  ) {
    return this.usersService.updateProfile(id, dto);
  }

  @ApiOperation({ summary: 'Đổi mật khẩu' })
  @Patch(':id/password')
  updatePassword(
    @Param('id') id: string,
    @Body() dto: { password: string }
  ) {
    return this.usersService.updatePassword(id, dto.password);
  }

  @ApiOperation({ summary: 'Vô hiệu hóa tài khoản' })
  @Delete(':id')
  disableUser(@Param('id') id: string) {
    return this.usersService.softDeleteUser(id);
  }

  @ApiOperation({ summary: 'Khôi phục tài khoản' })
  @Post(':id/restore')
  restoreUser(@Param('id') id: string) {
    return this.usersService.restoreUser(id);
  }

  @ApiOperation({ summary: 'Xóa vĩnh viễn tài khoản' })
  @Delete(':id/hard')
  hardDeleteUser(@Param('id') id: string) {
    return this.usersService.hardDeleteUser(id);
  }
}
