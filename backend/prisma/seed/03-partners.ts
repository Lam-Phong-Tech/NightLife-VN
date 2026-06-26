import { PrismaClient, PartnerAccount, User } from '@prisma/client';

/**
 * 2 Partner Accounts: one for HCM stores, one for HN stores.
 * Each linked to a PARTNER user created in 01-users.
 */
export async function seedPartners(
  prisma: PrismaClient,
  users: Record<string, User>,
): Promise<Record<string, PartnerAccount>> {
  console.log('  🤝 Seeding partner accounts...');
  const result: Record<string, PartnerAccount> = {};

  const partnerData = [
    {
      key: 'partner1',
      userId: users['partner1'].id,
      businessName: 'Saigon Nightlife Group',
      legalName: 'Công ty TNHH Saigon Nightlife',
      contactName: 'Trần Văn Đối Tác',
      contactPhone: '+84901000002',
      contactEmail: 'partner1@nightlife.vn',
      bankInfo: {
        bank: 'Vietcombank',
        accountNumber: '1234567890',
        accountName: 'TRAN VAN DOI TAC',
        branch: 'CN Quận 1',
      },
    },
    {
      key: 'partner2',
      userId: users['partner2'].id,
      businessName: 'Hanoi Entertainment Corp',
      legalName: 'Công ty CP Hanoi Entertainment',
      contactName: 'Lê Thị Đối Tác',
      contactPhone: '+84901000003',
      contactEmail: 'partner2@nightlife.vn',
      bankInfo: {
        bank: 'Techcombank',
        accountNumber: '0987654321',
        accountName: 'LE THI DOI TAC',
        branch: 'CN Hoàn Kiếm',
      },
    },
  ];

  for (const p of partnerData) {
    // PartnerAccount has no unique field besides `id`, so use findFirst + create/update
    const existing = await prisma.partnerAccount.findFirst({
      where: { userId: p.userId },
    });

    if (existing) {
      result[p.key] = await prisma.partnerAccount.update({
        where: { id: existing.id },
        data: {
          businessName: p.businessName,
          legalName: p.legalName,
          contactName: p.contactName,
          contactPhone: p.contactPhone,
          contactEmail: p.contactEmail,
          bankInfo: p.bankInfo,
          status: 'ACTIVE',
        },
      });
    } else {
      result[p.key] = await prisma.partnerAccount.create({
        data: {
          userId: p.userId,
          businessName: p.businessName,
          legalName: p.legalName,
          contactName: p.contactName,
          contactPhone: p.contactPhone,
          contactEmail: p.contactEmail,
          bankInfo: p.bankInfo,
          status: 'ACTIVE',
        },
      });
    }
  }

  console.log(`     ✓ ${Object.keys(result).length} partner accounts`);
  return result;
}
