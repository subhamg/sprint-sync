import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { UsersService } from "../modules/users/users.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Task, TaskStatus } from "../entities/task.entity";
import { Repository } from "typeorm";
import bcrypt from "bcrypt";

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const users = app.get(UsersService);
  const taskRepo = app.get<Repository<Task>>(getRepositoryToken(Task));

  const adminEmail = "admin@sprintsync.dev";
  const demoEmail = "demo@sprintsync.dev";
  const passwordHash = await bcrypt.hash("password123", 10);

  let admin = await users.findByEmail(adminEmail);
  if (!admin) {
    admin = await users.createUser({
      email: adminEmail,
      name: "Admin",
      passwordHash,
      isAdmin: true,
    });
    // seed admin task
    await taskRepo.save(
      taskRepo.create({
        title: "Wire observability",
        description: "Add pino logs, requestId, latency",
        status: TaskStatus.DONE,
        totalMilliseconds: 90 * 60 * 1000,
        ownerId: admin.id,
      }),
    );
  }

  let demo = await users.findByEmail(demoEmail);
  if (!demo) {
    demo = await users.createUser({
      email: demoEmail,
      name: "Demo User",
      passwordHash,
      isAdmin: false,
    });
    await taskRepo.save([
      taskRepo.create({
        title: "Set up project",
        description: "Install deps and run dev servers",
        status: TaskStatus.TODO,
        totalMilliseconds: 0,
        ownerId: demo.id,
      }),
      taskRepo.create({
        title: "Build login page",
        description: "Mantine + axios service",
        status: TaskStatus.IN_PROGRESS,
        totalMilliseconds: 30 * 60 * 1000,
        ownerId: demo.id,
      }),
    ]);
  }

  await app.close();
  // eslint-disable-next-line no-console
  console.log("Seed complete");
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
