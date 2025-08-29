import { TasksService } from "./tasks.service";
import { Repository } from "typeorm";
import { Task, TaskStatus } from "../../entities/task.entity";

function makeRepo(seed: Partial<Task>[]) {
  const data = new Map<string, Task>();
  seed.forEach((t) => data.set(t.id as string, t as Task));
  const repo = {
    find: jest.fn(async (opts?: any) => {
      const arr = Array.from(data.values());
      if (opts?.where?.ownerId) {
        return arr.filter((t) => t.ownerId === opts.where.ownerId);
      }
      return arr;
    }),
    findOneBy: jest.fn(
      async (where: Partial<Task>) => data.get(where.id as string) || null,
    ),
    create: jest.fn((obj: any) => obj as Task),
    save: jest.fn(async (t: Task) => {
      if (!t.id) t.id = `t${data.size + 1}`;
      data.set(t.id, { ...(data.get(t.id) as any), ...t } as Task);
      return data.get(t.id) as Task;
    }),
    delete: jest.fn(async (id: string) => data.delete(id)),
  } as unknown as Repository<Task>;
  return { repo, data };
}

describe("TasksService", () => {
  const { repo, data } = makeRepo([
    {
      id: "t1",
      title: "A",
      description: null,
      status: TaskStatus.TODO,
      totalMilliseconds: 0,
      ownerId: "u1",
      startedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const timeLogRepo: any = {
    create: jest.fn((o) => o),
    save: jest.fn(async (o) => o),
  };
  const svc = new TasksService(repo as any, timeLogRepo);

  it("allows TODO -> IN_PROGRESS -> DONE transitions for non-admin", async () => {
    const t1 = await svc.updateStatus(
      "t1",
      { nextStatus: TaskStatus.IN_PROGRESS },
      "u1",
      false,
    );
    expect(t1.status).toBe(TaskStatus.IN_PROGRESS);
    const t2 = await svc.updateStatus(
      "t1",
      { nextStatus: TaskStatus.DONE },
      "u1",
      false,
    );
    expect(t2.status).toBe(TaskStatus.DONE);
  });

  it("allows arbitrary transitions for non-admin now", async () => {
    data.get("t1")!.status = TaskStatus.TODO;
    const t = await svc.updateStatus(
      "t1",
      { nextStatus: TaskStatus.DONE },
      "u1",
      false,
    );
    expect(t.status).toBe(TaskStatus.DONE);
  });

  it("start/stop timer updates totalMilliseconds", async () => {
    const before = (data.get("t1")!.totalMilliseconds as number) || 0;
    await svc.startTimer("t1", "u1", false);
    // simulate 50ms work
    (data.get("t1") as any).startedAt = new Date(Date.now() - 50);
    const res = await svc.stopTimer("t1", "u1", false);
    expect(res.addedMilliseconds).toBeGreaterThanOrEqual(50);
    expect(res.task.totalMilliseconds).toBeGreaterThan(before);
  });
});
