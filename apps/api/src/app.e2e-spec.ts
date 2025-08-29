import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "./app.module";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";

describe("API E2E", () => {
  let app: INestApplication;
  let usersRepo: Repository<User>;

  beforeAll(async () => {
    process.env.JWT_SECRET = "e2e-secret";
    process.env.JWT_REFRESH_SECRET = "e2e-refresh";

    (process.env as any).NODE_ENV = "test";
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    usersRepo = moduleRef.get(getRepositoryToken(User));
  });

  afterAll(async () => {
    await app.close();
  });

  it("registers, logs in, gets me, creates task, starts/stops timer", async () => {
    const reg = await request(app.getHttpServer())
      .post("/auth/register")
      .send({ email: "e2e@sprint.dev", name: "E2E", password: "pass1234" })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "e2e@sprint.dev", password: "pass1234" })
      .expect(201)
      .catch(async () => {
        // some setups may return 200; accept either
        const res = await request(app.getHttpServer())
          .post("/auth/login")
          .send({ email: "e2e@sprint.dev", password: "pass1234" })
          .expect(200);
        return res;
      });

    const token = (login.body.accessToken as string) ?? login.body.token;

    const me = await request(app.getHttpServer())
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(me.body.userId).toBeDefined();

    const created = await request(app.getHttpServer())
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "E2E Task", description: "d" })
      .expect(201);

    const taskId = created.body.id;

    await request(app.getHttpServer())
      .post(`/tasks/${taskId}/start-timer`)
      .set("Authorization", `Bearer ${token}`)
      .expect(201);

    await new Promise((r) => setTimeout(r, 10));

    const stopped = await request(app.getHttpServer())
      .post(`/tasks/${taskId}/stop-timer`)
      .set("Authorization", `Bearer ${token}`)
      .expect(201);
    expect(stopped.body.task.totalMilliseconds).toBeGreaterThan(0);

    // status transitions (TODO -> IN_PROGRESS -> DONE)
    const toInProgress = await request(app.getHttpServer())
      .patch(`/tasks/${taskId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ nextStatus: "IN_PROGRESS" })
      .expect(200);
    expect(toInProgress.body.status).toBe("IN_PROGRESS");

    const toDone = await request(app.getHttpServer())
      .patch(`/tasks/${taskId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ nextStatus: "DONE" })
      .expect(200);
    expect(toDone.body.status).toBe("DONE");

    // non-admin transition now allowed
    const created2 = await request(app.getHttpServer())
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Change", description: "x" })
      .expect(201);
    const taskId2 = created2.body.id;
    await request(app.getHttpServer())
      .patch(`/tasks/${taskId2}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ nextStatus: "DONE" })
      .expect(200);

    // non-admin cannot delete
    await request(app.getHttpServer())
      .delete(`/tasks/${taskId2}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    // make an admin, then delete succeeds
    const adminEmail = "admin-e2e@sprint.dev";
    await request(app.getHttpServer())
      .post("/auth/register")
      .send({ email: adminEmail, name: "Admin", password: "pass1234" })
      .expect(201);
    const adminUser = await usersRepo.findOne({ where: { email: adminEmail } });
    if (adminUser) {
      adminUser.isAdmin = true;
      await usersRepo.save(adminUser);
    }
    const adminLogin = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: adminEmail, password: "pass1234" })
      .expect(201)
      .catch(async () => {
        const res = await request(app.getHttpServer())
          .post("/auth/login")
          .send({ email: adminEmail, password: "pass1234" })
          .expect(200);
        return res;
      });
    const adminToken =
      (adminLogin.body.accessToken as string) ?? adminLogin.body.token;

    await request(app.getHttpServer())
      .delete(`/tasks/${taskId2}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
  });
});
