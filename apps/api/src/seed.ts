import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from './entities/user.entity';
import { Task, TaskStatus } from './entities/task.entity';
import bcrypt from 'bcrypt';
import path from 'node:path';

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || path.resolve(process.cwd(), '.env') });

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Task],
  synchronize: false,
});

async function seed() {
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const taskRepo = dataSource.getRepository(Task);

  const adminEmail = 'admin@sprintsync.dev';
  const demoEmail = 'demo@sprintsync.dev';
  const passwordHash = await bcrypt.hash('password123', 10);

  let admin = await userRepo.findOne({ where: { email: adminEmail } });
  if (!admin) {
    admin = userRepo.create({ email: adminEmail, name: 'Admin', passwordHash, isAdmin: true });
    await userRepo.save(admin);
  }

  let demo = await userRepo.findOne({ where: { email: demoEmail } });
  if (!demo) {
    demo = userRepo.create({ email: demoEmail, name: 'Demo User', passwordHash, isAdmin: false });
    await userRepo.save(demo);
  }

  const existingTasks = await taskRepo.count();
  if (existingTasks === 0) {
    await taskRepo.save([
      taskRepo.create({
        title: 'Set up NestJS project',
        description: 'Initialize API and basic modules',
        status: TaskStatus.TODO,
        totalMinutes: 0,
        ownerId: admin.id,
      }),
      taskRepo.create({
        title: 'Build login page',
        description: 'Next.js Mantine form',
        status: TaskStatus.IN_PROGRESS,
        totalMinutes: 45,
        ownerId: demo.id,
      }),
      taskRepo.create({
        title: 'Wire TypeORM',
        description: 'Entities, migrations, seed',
        status: TaskStatus.DONE,
        totalMinutes: 120,
        ownerId: admin.id,
      }),
    ]);
  }

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
