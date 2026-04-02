import bcrypt from 'bcryptjs';
import { PrismaClient, Role, RequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

const users = [
  ['Aarav Patel', 'aarav.patel@example.com'],
  ['Emma Johnson', 'emma.johnson@example.com'],
  ['Noah Smith', 'noah.smith@example.com'],
  ['Olivia Brown', 'olivia.brown@example.com'],
  ['Liam Wilson', 'liam.wilson@example.com'],
  ['Sophia Davis', 'sophia.davis@example.com'],
  ['Mason Clark', 'mason.clark@example.com'],
  ['Isabella Lewis', 'isabella.lewis@example.com']
];

const titles = [
  'Payment failure on checkout',
  'Need export for monthly analytics',
  'Two-factor authentication setup issue',
  'Notification emails delayed',
  'Dashboard chart loading slowly',
  'CSV upload format clarification',
  'Unable to update account timezone',
  'Subscription invoice mismatch',
  'Mobile layout breaks on profile page',
  'Need API key rotation support'
];

const descriptions = [
  'I attempted checkout with Visa and Mastercard, both failed with a generic error. Could you investigate logs for my account?',
  'Our finance team needs a downloadable monthly summary report in CSV and PDF formats for audits.',
  'When scanning the QR code for 2FA setup, it shows invalid authenticator token. Tried with multiple apps.',
  'Emails are getting delivered 15-20 minutes late after requests are submitted. This affects response SLAs.',
  'The performance graph takes around 8 seconds to load after login on high-speed internet.',
  'Please share the expected CSV template columns for bulk ticket import. Current docs are unclear for date format.',
  'Timezone resets to UTC every time I save profile settings. We need America/New_York by default.',
  'The invoice amount in billing differs from plan pricing shown in the subscription panel.',
  'Profile page fields overlap on iPhone 13 Safari while editing user details.',
  'Need option to rotate and revoke API keys without downtime for our production integrations.'
];

const statuses = [RequestStatus.PENDING, RequestStatus.IN_PROGRESS, RequestStatus.COMPLETED];

async function main() {
  await prisma.request.deleteMany();
  await prisma.user.deleteMany();

  const hashedCustomer = await bcrypt.hash('customer123', 10);
  const hashedDev = await bcrypt.hash('dev12345', 10);

  const createdUsers = [];

  for (const [name, email] of users) {
    const user = await prisma.user.create({
      data: { name, email, password: hashedCustomer, role: Role.CUSTOMER }
    });
    createdUsers.push(user);
  }

  await prisma.user.create({
    data: {
      name: 'Dev Admin',
      email: 'developer.dashboard@example.com',
      password: hashedDev,
      role: Role.DEVELOPER
    }
  });

  for (let i = 0; i < 24; i += 1) {
    const user = createdUsers[i % createdUsers.length];
    await prisma.request.create({
      data: {
        userId: user.id,
        title: titles[i % titles.length],
        description: descriptions[i % descriptions.length],
        status: statuses[i % statuses.length],
        createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 6)
      }
    });
  }

  console.log('Seeded 9 users (8 customers + 1 developer) and 24 requests.');
  console.log('Customer password: customer123 | Developer password: dev12345');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
