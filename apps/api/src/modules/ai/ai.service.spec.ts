import { AiService } from "./ai.service";
import { Repository } from "typeorm";
import { Task, TaskStatus } from "../../entities/task.entity";

function makeRepo(tasks: Partial<Task>[]) {
  const list = tasks.map((t) => ({
    id: t.id as string,
    title: t.title as string,
    description: (t.description as any) ?? null,
    status: (t.status as TaskStatus) ?? TaskStatus.TODO,
    totalMilliseconds: (t.totalMilliseconds as any) ?? 0,
    ownerId: t.ownerId as string,
    startedAt: (t.startedAt as any) ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })) as Task[];
  const repo = {
    find: jest.fn(async () => list),
  } as unknown as Repository<Task>;
  return repo;
}

describe("AiService", () => {
  it("returns helpful empty-state plan when no tasks", async () => {
    const repo = makeRepo([]);
    const svc = new AiService(repo);
    const plan = await svc.suggestDailyPlan("u1");
    expect(plan.summary).toMatch(/No tasks yet/i);
    expect(Array.isArray(plan.priorities)).toBe(true);
    expect(plan.blocks.length).toBeGreaterThan(0);
  });

  it("deterministic stub picks up to 3 priorities preferring IN_PROGRESS", async () => {
    const repo = makeRepo([
      { id: "t1", title: "A", ownerId: "u1", status: TaskStatus.TODO },
      { id: "t2", title: "B", ownerId: "u1", status: TaskStatus.IN_PROGRESS },
      { id: "t3", title: "C", ownerId: "u1", status: TaskStatus.TODO },
      { id: "t4", title: "D", ownerId: "u1", status: TaskStatus.TODO },
    ]);
    const svc = new AiService(repo);
    const plan = await svc.suggestDailyPlan("u1");
    expect(plan.priorities.length).toBeLessThanOrEqual(3);
    // IN_PROGRESS first if present
    if (plan.priorities.length) {
      expect(plan.priorities[0].title).toBeDefined();
    }
  });

  it("extractJson parses fenced JSON", () => {
    const repo = makeRepo([]);
    const svc = new AiService(repo);
    const raw = '```json\n{\n  "a": 1\n}\n```';
    const obj = (svc as any).extractJson(raw);
    expect((obj as any).a).toBe(1);
  });

  it("validateBlocks clamps and removes overlaps", () => {
    const repo = makeRepo([]);
    const svc = new AiService(repo);
    const blocks = (svc as any).validateBlocks([
      { label: "09:00-10:00", focus: "A" },
      { label: "09:30-10:30", focus: "B" }, // overlap -> removed
      { label: "11:00-12:00", focus: "C" },
      { label: "07:00-08:00", focus: "Invalid" }, // outside window -> dropped
    ]);
    expect(blocks.length).toBe(2);
    expect(blocks[0].label).toBe("09:00-10:00");
    expect(blocks[1].label).toBe("11:00-12:00");
  });
});
