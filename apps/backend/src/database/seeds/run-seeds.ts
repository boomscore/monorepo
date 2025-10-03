import { dataSource } from '@/config/database.config';
import { User, UserRole } from '@/modules/users/entities/user.entity';
import { SubscriptionPlan } from '@/modules/payments/entities/subscription.entity';
import * as bcrypt from 'bcrypt';

async function runSeeds() {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  try {
    await seedUsers();
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

async function seedUsers() {
  const userRepository = dataSource.getRepository(User);

  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@boomscore.ai' },
  });

  if (existingAdmin) {
    return;
  }

  const users = [
    {
      email: 'admin@boomscore.ai',
      username: 'admin',
      password: await bcrypt.hash('Admin123!', 12),
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.ADMIN,
      subscriptionPlan: SubscriptionPlan.ULTRA,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
    {
      email: 'demo@boomscore.ai',
      username: 'demo_user',
      password: await bcrypt.hash('Demo123!', 12),
      firstName: 'Demo',
      lastName: 'User',
      role: UserRole.USER,
      subscriptionPlan: SubscriptionPlan.FREE,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  ];

  for (const userData of users) {
    const user = userRepository.create(userData);
    await userRepository.save(user);
    console.log(`   Created user: ${user.email} (${user.role})`);
  }
}

if (require.main === module) {
  runSeeds()
    .then(() => {
      console.log('Seeding process completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

export { runSeeds };
