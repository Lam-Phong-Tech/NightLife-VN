# Analysis and Implementation Plan: Settings & User/Staff Management Features

This report provides the detailed design, validation of existing structures, and implementation plan for the backend password/staff APIs, Prisma database models, frontend portal settings integration, and corresponding unit/integration test specifications.

---

## 1. Prisma Models Verification

We verified `backend/prisma/schema.prisma` (lines 277-330, 478-536, and 1154-1170). The current database models are fully supportive of our features without requiring schema modifications.

### Model Definitions & Relationships
*   **`User` model (`users` table)**:
    *   `id`: `String` (UUID, primary key)
    *   `role`: `UserRole` enum (`USER`, `PARTNER`, `OPERATOR`, `STAFF`, `ADMIN`, `SUPER_ADMIN`)
    *   `storePermissions`: Relation `StorePermission[]` mapping permissions.
    *   `ownedStores`: Relation `Store[]` via `@relation("StoreOwner")`.
*   **`Store` model (`stores` table)**:
    *   `id`: `String` (UUID, primary key)
    *   `ownerId`: `String` (foreign key to `User.id` for `StoreOwner` relation)
    *   `userPermissions`: Relation `StorePermission[]`.
*   **`StorePermission` model (`store_permissions` table)**:
    *   `id`: `String` (UUID, primary key)
    *   `userId`: `String` (foreign key to `User.id`)
    *   `storeId`: `String` (foreign key to `Store.id`)
    *   `permissions`: `String[]` (stores individual permission keys like `coupon.scan`, `booking.partner.view`, `bill.partner.view`)
    *   `status`: `RoleStatus` (default `ACTIVE`)
    *   `@@unique([userId, storeId])`: Unique constraint prevents duplicate assignments.

---

## 2. Backend API Design & Permissions Validation

### A. User Change-Password API
*   **Route**: `POST /users/change-password`
*   **Guards**: `JwtAuthGuard` (Requires Bearer authorization token)
*   **Controller**: `src/users/users.controller.ts`

#### DTO Design (`src/users/dto/change-password.dto.ts`):
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Mật khẩu cũ hiện tại', example: 'OldPassword123!' })
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @ApiProperty({ description: 'Mật khẩu mới', example: 'NewPassword123!' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có tối thiểu 6 ký tự' })
  newPassword: string;
}
```

#### Controller Endpoint Method:
```typescript
  @ApiOperation({ summary: 'Thay đổi mật khẩu tài khoản' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Req() request: RequestWithUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(request.user.id, dto);
  }
```

#### Service Logic (`src/users/users.service.ts`):
```typescript
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.findByIdOrThrow(userId);
    const isMatched = await this.passwordService.verify(dto.oldPassword, user.passwordHash);
    if (!isMatched) {
      throw new UnauthorizedException('Mật khẩu cũ không chính xác');
    }
    await this.updatePassword(userId, dto.newPassword);
    return { success: true };
  }
```

---

### B. Partner Staff Management APIs
*   **Guards**: `JwtAuthGuard`, `RolesGuard`, `@Roles('PARTNER', 'ADMIN')`
*   **Controller**: `src/partner-staff/partner-staff.controller.ts` (New module `partner-staff`)
*   **Security Principle**: All operations demand `storeId` context validation using `AccessService.ensureStoreAccess(user, storeId)` to verify the operator has administrative permission over the targeted store.

#### DTO Design (`src/partner-staff/dto/create-staff.dto.ts`):
```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({ example: 'store-uuid' })
  @IsNotEmpty()
  @IsString()
  storeId: string;

  @ApiProperty({ example: 'staff@domain.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Staff Member' })
  @IsNotEmpty()
  @IsString()
  displayName: string;

  @ApiPropertyOptional({ example: '0987654321' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: ['coupon.scan', 'booking.partner.view'] })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
```

#### Controller Implementation:
```typescript
import { Controller, Get, Post, Delete, Body, Query, Param, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AccessService } from '../access/access.service';
import { PartnerStaffService } from './partner-staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';

@ApiTags('partner/staff')
@Controller('partner/staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PARTNER', 'ADMIN')
@ApiBearerAuth()
export class PartnerStaffController {
  constructor(
    private readonly staffService: PartnerStaffService,
    private readonly accessService: AccessService,
  ) {}

  @ApiOperation({ summary: 'Lấy danh sách nhân viên thuộc cửa hàng' })
  @Get()
  async getStaff(@Req() req: any, @Query('storeId') storeId: string) {
    await this.accessService.ensureStoreAccess(req.user, storeId);
    return this.staffService.getStaffByStore(storeId);
  }

  @ApiOperation({ summary: 'Tạo hoặc liên kết tài khoản nhân viên' })
  @Post()
  async createStaff(@Req() req: any, @Body() dto: CreateStaffDto) {
    await this.accessService.ensureStoreAccess(req.user, dto.storeId);
    return this.staffService.assignStaffToStore(dto);
  }

  @ApiOperation({ summary: 'Xóa quyền nhân viên khỏi cửa hàng' })
  @Delete(':userId')
  async removeStaff(
    @Req() req: any,
    @Param('userId') userId: string,
    @Query('storeId') storeId: string,
  ) {
    await this.accessService.ensureStoreAccess(req.user, storeId);
    return this.staffService.removeStaffFromStore(userId, storeId);
  }
}
```

#### Service Implementation (`src/partner-staff/partner-staff.service.ts`):
```typescript
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../common/password.service';
import { CreateStaffDto } from './dto/create-staff.dto';

@Injectable()
export class PartnerStaffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async getStaffByStore(storeId: string) {
    const permissions = await this.prisma.storePermission.findMany({
      where: { storeId, user: { role: 'STAFF' }, deletedAt: null },
      include: {
        user: {
          select: { id: true, email: true, displayName: true, phone: true, status: true, createdAt: true },
        },
      },
    });

    return permissions.map((p) => ({
      userId: p.userId,
      email: p.user.email,
      displayName: p.user.displayName,
      phone: p.user.phone,
      status: p.user.status,
      permissions: p.permissions,
      createdAt: p.user.createdAt,
    }));
  }

  async assignStaffToStore(dto: CreateStaffDto) {
    const email = dto.email.trim().toLowerCase();
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      if (user.role !== 'STAFF') {
        throw new ConflictException('Email đã đăng ký vai trò khác, không thể gán làm nhân viên.');
      }

      const existingPermission = await this.prisma.storePermission.findUnique({
        where: { userId_storeId: { userId: user.id, storeId: dto.storeId } },
      });

      if (existingPermission && !existingPermission.deletedAt) {
        throw new ConflictException('Nhân viên đã được gán vào cửa hàng này trước đó.');
      }

      return this.prisma.storePermission.upsert({
        where: { userId_storeId: { userId: user.id, storeId: dto.storeId } },
        update: { permissions: dto.permissions, status: 'ACTIVE', deletedAt: null },
        create: { userId: user.id, storeId: dto.storeId, permissions: dto.permissions, status: 'ACTIVE' },
      });
    }

    // Tạo mới tài khoản STAFF
    return this.prisma.$transaction(async (tx) => {
      const passwordHash = await this.passwordService.hash(dto.password);
      const newUser = await tx.user.create({
        data: { email, passwordHash, displayName: dto.displayName, phone: dto.phone, role: 'STAFF' },
      });

      await tx.storePermission.create({
        data: { userId: newUser.id, storeId: dto.storeId, permissions: dto.permissions, status: 'ACTIVE' },
      });

      return newUser;
    });
  }

  async removeStaffFromStore(userId: string, storeId: string) {
    const permission = await this.prisma.storePermission.findUnique({
      where: { userId_storeId: { userId, storeId } },
    });

    if (!permission || permission.deletedAt) {
      throw new NotFoundException('Quyền nhân viên này không tồn tại.');
    }

    return this.prisma.storePermission.update({
      where: { userId_storeId: { userId, storeId } },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
  }
}
```

---

## 3. Frontend Partner Portal Sidebar Integration

### A. Sidebar Modification Routing Configuration
In `frontend/apps/web/src/app/partner/page.tsx`:
1.  **Extend `panelKeys`**:
    ```typescript
    const panelKeys = ['overview', 'scan', 'settlement', 'listing', 'bill', 'settings'] as const;
    type PanelKey = (typeof panelKeys)[number];
    ```
2.  **Add `Settings` to `navItems`**:
    ```typescript
    import { Settings, ... } from 'lucide-react';
    // ...
    const navItems: { key: PanelKey; label: string; icon: LucideIcon }[] = [
      { key: 'scan', label: 'Quét mã QR', icon: QrCode },
      { key: 'overview', label: 'Tổng quan', icon: Home },
      { key: 'settlement', label: 'Đối soát', icon: FileClock },
      { key: 'listing', label: 'Đăng thông tin', icon: Camera },
      { key: 'bill', label: 'Gửi hóa đơn', icon: ReceiptText },
      { key: 'settings', label: 'Cài đặt', icon: Settings }, // Settings Tab Added
    ];
    ```
3.  **Define Settings title in `panelTitles`**:
    ```typescript
    const panelTitles: Record<PanelKey, { eyebrow: string; title: string }> = {
      // ...
      settings: { eyebrow: 'PARTNER SETTINGS', title: 'Cài đặt tài khoản' },
    };
    ```

---

## 4. Custom Frontend UI Components

### A. `ThemedListingSelect` Extraction
We recommend extracting the local `ThemedListingSelect` component inside `partner/page.tsx` (lines 1383-1510) to a reusable component under `frontend/apps/web/src/components/ui/ThemedListingSelect.tsx`.

#### Component Definition:
```typescript
'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export type SelectOption = { value: string; label: string };

export type ThemedListingSelectProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: SelectOption[];
  hasError?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  compact?: boolean;
  style?: React.CSSProperties;
};

// Styling Variables aligned with Vietyoru brand theme
const colors = {
  surface2: 'var(--partner-surface-2, rgba(255,255,255,.04))',
  borderGold22: 'var(--partner-border-gold-22, rgba(212,178,106,.22))',
  borderGold32: 'var(--partner-border-gold-32, rgba(212,178,106,.32))',
  popoverBg: 'var(--partner-popover-bg, linear-gradient(180deg,rgba(28,27,31,.98),rgba(12,12,15,.98)))',
  goldBright: 'var(--partner-gold-bright, #e3c27e)',
  goldGrad: 'var(--partner-gold-grad, linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a))',
  onGold: 'var(--partner-on-gold, #241a0a)',
  text: 'var(--partner-text, #f3f0ea)',
  muted: 'var(--partner-muted, #8c8679)',
  danger: 'var(--partner-danger, #ffb4a8)',
};

export function ThemedListingSelect({
  value,
  onChange,
  placeholder,
  options,
  hasError,
  disabled,
  ariaLabel,
  compact,
  style,
}: ThemedListingSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div
      onBlur={(event) => {
        const nextFocus = event.relatedTarget;
        if (!nextFocus || !event.currentTarget.contains(nextFocus as Node)) {
          setIsOpen(false);
        }
      }}
      style={{ position: 'relative', minWidth: compact ? '96px' : undefined, ...style }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((c) => (disabled ? false : !c))}
        aria-label={ariaLabel ?? placeholder}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          minHeight: compact ? '34px' : '44px',
          border: `1px solid ${hasError ? colors.danger : colors.borderGold22}`,
          borderRadius: compact ? '9px' : '12px',
          background: colors.surface2,
          color: selectedOption ? colors.text : colors.muted,
          font: 'inherit',
          fontSize: compact ? '12px' : '13px',
          fontWeight: 900,
          padding: compact ? '0 8px' : '0 12px',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          opacity: disabled ? 0.65 : 1,
          textAlign: 'left',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown size={compact ? 14 : 16} style={{ flex: '0 0 auto', color: colors.goldBright }} />
      </button>
      {isOpen && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 180,
            maxHeight: compact ? '220px' : '280px',
            overflowY: 'auto',
            border: `1px solid ${colors.borderGold32}`,
            borderRadius: '12px',
            background: colors.popoverBg,
            boxShadow: '0 24px 50px -26px rgba(0,0,0,.86)',
            padding: '6px',
          }}
        >
          {options.length ? (
            options.map((option) => {
              const selected = option.value === value;
              return (
                <button
                  key={`${option.value}-${option.label}`}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  style={{
                    width: '100%',
                    minHeight: compact ? '32px' : '36px',
                    border: 0,
                    borderRadius: '9px',
                    background: selected ? colors.goldGrad : 'transparent',
                    color: selected ? colors.onGold : colors.text,
                    font: 'inherit',
                    fontSize: compact ? '12px' : '12.5px',
                    fontWeight: selected ? 900 : 800,
                    textAlign: 'left',
                    padding: '0 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {option.label}
                  </span>
                </button>
              );
            })
          ) : (
            <div style={{ padding: '10px', color: colors.muted, fontSize: '12px', fontWeight: 800 }}>
              Chưa có dữ liệu
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

### B. `useSystemFeedback` & Confirm Modal Usage in Settings
Inside `PartnerPage`:
```typescript
import { useSystemFeedback } from '@/components/ui/SystemFeedback';

// inside PartnerPage functional component:
const feedback = useSystemFeedback();

// Toasts notifications:
const triggerSuccessToast = (msg: string) => {
  feedback.showToast({
    tone: 'success',
    title: 'Thành công',
    description: msg,
    durationMs: 4000,
  });
};

const triggerErrorToast = (err: string) => {
  feedback.showToast({
    tone: 'error',
    title: 'Lỗi',
    description: err,
    durationMs: 5000,
  });
};

// Confirm Modal dialog before deleting a staff:
const confirmDeleteStaff = (userId: string, displayName: string, storeId: string) => {
  feedback.showModal({
    tone: 'warning',
    title: 'Xác nhận xóa nhân viên',
    description: `Bạn có chắc chắn muốn xóa nhân viên ${displayName} khỏi cửa hàng này không? Họ sẽ mất toàn bộ quyền truy cập vào cửa hàng.`,
    primaryLabel: 'Xóa bỏ',
    secondaryLabel: 'Hủy bỏ',
    destructive: true,
    onPrimary: async () => {
      try {
        await apiClient(`/partner/staff/${userId}`, {
          method: 'DELETE',
          params: { storeId },
        });
        triggerSuccessToast(`Đã xóa nhân viên ${displayName}`);
        // reload staff list
        loadStaffList(storeId);
      } catch (err: any) {
        triggerErrorToast(err.message || 'Lỗi khi xóa nhân viên');
      } finally {
        feedback.closeModal();
      }
    },
    onSecondary: () => {
      feedback.closeModal();
    },
  });
};
```

---

## 5. Unit / Integration Tests Layout & Configuration

### A. Users Controller Unit Test (`backend/src/users/users.controller.spec.ts`)
Creates mock implementations of NestJS components to verify that:
1.  The controller properly maps requests to `usersService.changePassword`.
2.  `changePassword` is guarded by `JwtAuthGuard`.

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const mockUsersService = {
      changePassword: jest.fn(),
      findByIdOrThrow: jest.fn(),
      toPublicUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // bypass guard validation in unit scope
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  it('should call UsersService.changePassword with req.user.id and DTO', async () => {
    const req = { user: { id: 'user-uuid' } };
    const dto: ChangePasswordDto = {
      oldPassword: 'OldPassword1!',
      newPassword: 'NewPassword2!',
    };

    service.changePassword.mockResolvedValue({ success: true } as any);

    const result = await controller.changePassword(req as any, dto);

    expect(service.changePassword).toHaveBeenCalledWith('user-uuid', dto);
    expect(result).toEqual({ success: true });
  });

  it('should forward exceptions thrown by UsersService', async () => {
    const req = { user: { id: 'user-uuid' } };
    const dto: ChangePasswordDto = {
      oldPassword: 'WrongOldPassword!',
      newPassword: 'NewPassword2!',
    };

    service.changePassword.mockRejectedValue(new UnauthorizedException('Mật khẩu cũ không chính xác'));

    await expect(controller.changePassword(req as any, dto)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
```

---

### B. Partner Staff Controller Unit Test (`backend/src/partner-staff/partner-staff.controller.spec.ts`)
Ensures role checking is configured on routes and that `AccessService.ensureStoreAccess` runs correctly.

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PartnerStaffController } from './partner-staff.controller';
import { PartnerStaffService } from './partner-staff.service';
import { AccessService } from '../access/access.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { ForbiddenException } from '@nestjs/common';

describe('PartnerStaffController', () => {
  let controller: PartnerStaffController;
  let service: jest.Mocked<PartnerStaffService>;
  let accessService: jest.Mocked<AccessService>;

  beforeEach(async () => {
    const mockStaffService = {
      getStaffByStore: jest.fn(),
      assignStaffToStore: jest.fn(),
      removeStaffFromStore: jest.fn(),
    };

    const mockAccessService = {
      ensureStoreAccess: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartnerStaffController],
      providers: [
        { provide: PartnerStaffService, useValue: mockStaffService },
        { provide: AccessService, useValue: mockAccessService },
      ],
    }).compile();

    controller = module.get<PartnerStaffController>(PartnerStaffController);
    service = module.get(PartnerStaffService);
    accessService = module.get(AccessService);
  });

  it('should require store access validation on GET /partner/staff', async () => {
    const req = { user: { id: 'partner-uuid', role: 'PARTNER' } };
    const storeId = 'store-uuid';

    accessService.ensureStoreAccess.mockResolvedValue(undefined as any);
    service.getStaffByStore.mockResolvedValue([]);

    await controller.getStaff(req, storeId);

    expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(req.user, storeId);
    expect(service.getStaffByStore).toHaveBeenCalledWith(storeId);
  });

  it('should block GET /partner/staff if ensureStoreAccess fails', async () => {
    const req = { user: { id: 'partner-uuid', role: 'PARTNER' } };
    const storeId = 'other-store-uuid';

    accessService.ensureStoreAccess.mockRejectedValue(new ForbiddenException('Forbidden'));

    await expect(controller.getStaff(req, storeId)).rejects.toThrow(ForbiddenException);
    expect(service.getStaffByStore).not.toHaveBeenCalled();
  });
});
```

---

## 6. Layout Compliance & Routing Check

1.  **Backend Source Locations**:
    *   `backend/src/partner-staff` is a new module folder. It contains `partner-staff.module.ts`, `partner-staff.controller.ts`, `partner-staff.service.ts`, and test spec `partner-staff.controller.spec.ts`.
    *   Existing files `users.controller.ts` and `users.service.ts` reside inside `backend/src/users`. The test spec `users.controller.spec.ts` will be created directly in `backend/src/users/`.
2.  **Frontend Layout Compliance**:
    *   The `ThemedListingSelect.tsx` component is extracted out from the monolithic `partner/page.tsx` and moved to `frontend/apps/web/src/components/ui/ThemedListingSelect.tsx`.
    *   `SystemFeedback.tsx` is located at `frontend/apps/web/src/components/ui/SystemFeedback.tsx` and exports `useSystemFeedback` natively.
3.  **Project-Scoped Rules Checklist**:
    *   *Browser Alert restriction*: Checked. The use of `useSystemFeedback` modal is mandated for deletion, and toasts are used for actions alerts instead of browser `alert()`.
    *   *Native HTML Select restriction*: Checked. `ThemedListingSelect` custom dropdown component is mapped for store/permission select instead of standard `<select>`.
    *   *Native Browser Datepicker restriction*: Checked. None of the pages use the browser native date picker.
