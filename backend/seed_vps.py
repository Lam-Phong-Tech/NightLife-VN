import paramiko
import time

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

print("Connecting to VPS...")
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026')
print("Connected!")

seed_script = """
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding test bills...');
  
  // Find a store to attach to
  let store = await prisma.store.findFirst({ where: { status: 'ACTIVE' } });
  if (!store) {
    store = await prisma.store.create({
      data: {
        name: 'Test Store NightLife',
        slug: 'test-store-nl-' + Date.now(),
        category: 'BAR',
        city: 'Ho Chi Minh City',
        status: 'ACTIVE'
      }
    });
    console.log('Created test store:', store.id);
  }

  // Create different types of bills for testing
  const billsData = [
    {
      storeId: store.id,
      status: 'SUBMITTED',
      submitterType: 'MEMBER',
      subtotalVnd: 10000000,
      discountVnd: 1000000,
      totalVnd: 9000000,
      commissionAmountVnd: 900000, // 10%
      pointEarned: 90,
      usedAt: new Date(),
    },
    {
      storeId: store.id,
      status: 'SUBMITTED',
      submitterType: 'PARTNER',
      subtotalVnd: 5000000,
      discountVnd: 0,
      totalVnd: 5000000,
      commissionAmountVnd: 750000, // 15%
      pointEarned: 50,
      usedAt: new Date(Date.now() - 86400000),
    },
    {
      storeId: store.id,
      status: 'VERIFIED',
      submitterType: 'VIP',
      subtotalVnd: 20000000,
      discountVnd: 2000000,
      totalVnd: 18000000,
      commissionAmountVnd: 1800000,
      pointEarned: 180,
      usedAt: new Date(Date.now() - 86400000 * 2),
    },
    {
      storeId: store.id,
      status: 'REJECTED',
      submitterType: 'MEMBER',
      subtotalVnd: 2000000,
      discountVnd: 0,
      totalVnd: 2000000,
      commissionAmountVnd: 200000,
      pointEarned: 20,
      usedAt: new Date(),
      rejectionReason: 'Hóa đơn quá mờ',
    }
  ];

  for (const b of billsData) {
    const created = await prisma.bill.create({ data: b });
    console.log('Created bill:', created.id, created.status);
    
    // Add dummy media for the first one to test image preview
    if (b.status === 'SUBMITTED' && b.submitterType === 'MEMBER') {
       await prisma.media.create({
         data: {
           url: 'https://placehold.co/600x800?text=Mock+Bill+Image',
           type: 'IMAGE',
           status: 'READY',
           access: 'PUBLIC',
           billId: created.id
         }
       });
       console.log('Attached image to bill:', created.id);
    }
  }

  console.log('Seeding complete.');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
"""

print("Writing script to VPS...")
sftp = ssh.open_sftp()
with sftp.file('/var/www/api.demonightlight.test9.io.vn/seed-test-bills.ts', 'w') as f:
    f.write(seed_script)
sftp.close()

print("Executing seed script...")
stdin, stdout, stderr = ssh.exec_command('cd /var/www/api.demonightlight.test9.io.vn && npx tsx seed-test-bills.ts')

exit_status = stdout.channel.recv_exit_status()
print("Exit Status:", exit_status)
print("STDOUT:")
print(stdout.read().decode())
print("STDERR:")
print(stderr.read().decode())

ssh.close()
print("Done.")
