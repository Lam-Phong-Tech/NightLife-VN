import { PrismaClient, User, Role } from '@prisma/client';

interface UserSeed {
  email: string;
  displayName: string;
  phone?: string;
  role: 'ADMIN' | 'PARTNER' | 'USER';
  tier: 'FREE' | 'PREMIUM' | 'VIP';
  roleKey?: string; // maps to Role.key for UserRoleAssignment
  profile?: {
    fullName: string;
    gender?: string;
    bio?: string;
  };
}

const USERS: UserSeed[] = [
  {
    email: 'admin@nightlife.vn',
    displayName: 'NightLife Admin',
    phone: '+84901000001',
    role: 'ADMIN',
    tier: 'VIP',
    roleKey: 'admin',
    profile: {
      fullName: 'Nguyễn Quản Trị',
      gender: 'male',
      bio: 'Platform administrator — NightLife Vietnam',
    },
  },
  {
    email: 'partner1@nightlife.vn',
    displayName: 'Trần Đối Tác',
    phone: '+84901000002',
    role: 'PARTNER',
    tier: 'PREMIUM',
    roleKey: 'partner',
    profile: {
      fullName: 'Trần Văn Đối Tác',
      gender: 'male',
      bio: 'HCM partner — managing 5 nightlife venues in District 1, 3, and 7',
    },
  },
  {
    email: 'partner2@nightlife.vn',
    displayName: 'Lê Đối Tác',
    phone: '+84901000003',
    role: 'PARTNER',
    tier: 'PREMIUM',
    roleKey: 'partner',
    profile: {
      fullName: 'Lê Thị Đối Tác',
      gender: 'female',
      bio: 'Hanoi partner — managing 5 nightlife venues in Hoàn Kiếm, Tây Hồ, and Cầu Giấy',
    },
  },
  {
    email: 'partner@nightlife.vn',
    displayName: 'Demo Partner',
    phone: '+84901000006',
    role: 'PARTNER',
    tier: 'PREMIUM',
    roleKey: 'partner',
    profile: {
      fullName: 'Demo Partner',
      gender: 'male',
      bio: 'Demo partner account for UI sign-in and store management review',
    },
  },
  {
    email: 'member@nightlife.vn',
    displayName: 'Phạm Thành Viên',
    phone: '+84901000004',
    role: 'USER',
    tier: 'FREE',
    profile: {
      fullName: 'Phạm Văn Thành Viên',
      gender: 'male',
      bio: 'Regular member — enjoys nightlife in HCMC',
    },
  },
  {
    email: 'vip@nightlife.vn',
    displayName: 'Hoàng VIP',
    phone: '+84901000005',
    role: 'USER',
    tier: 'VIP',
    profile: {
      fullName: 'Hoàng Thị VIP',
      gender: 'female',
      bio: 'VIP member — frequent visitor to premium lounges and bars',
    },
  },
];

export async function seedUsers(
  prisma: PrismaClient,
  passwordHash: string,
  roles: Record<string, Role>,
): Promise<Record<string, User>> {
  console.log('  👤 Seeding users...');
  const result: Record<string, User> = {};

  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        displayName: u.displayName,
        phone: u.phone,
        role: u.role,
        tier: u.tier,
        status: 'ACTIVE',
      },
      create: {
        email: u.email,
        passwordHash,
        displayName: u.displayName,
        phone: u.phone,
        role: u.role,
        tier: u.tier,
        status: 'ACTIVE',
      },
    });

    // Upsert profile
    if (u.profile) {
      await prisma.profile.upsert({
        where: { userId: user.id },
        update: {
          fullName: u.profile.fullName,
          gender: u.profile.gender,
          bio: u.profile.bio,
        },
        create: {
          userId: user.id,
          fullName: u.profile.fullName,
          gender: u.profile.gender,
          bio: u.profile.bio,
          status: 'ACTIVE',
        },
      });
    }

    // Assign role via UserRoleAssignment (idempotent via unique constraint)
    if (u.roleKey && roles[u.roleKey]) {
      await prisma.userRoleAssignment.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: roles[u.roleKey].id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          roleId: roles[u.roleKey].id,
        },
      });
    }

    // Key by email prefix (e.g. "admin", "partner1", "partner2", "member", "vip")
    const key = u.email.split('@')[0];
    result[key] = user;
  }

  console.log(`     ✓ ${Object.keys(result).length} users (with profiles & role assignments)`);
  return result;
}
