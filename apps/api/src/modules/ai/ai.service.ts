import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Task, TaskStatus } from "../../entities/task.entity";
import OpenAI from "openai";

interface AiPlanPriority { taskId: string; title: string; reason: string }
interface AiPlanBlock { label: string; focus: string }
export interface AiPlanResponse {
  summary: string;
  priorities: AiPlanPriority[];
  blocks: AiPlanBlock[];
}

@Injectable()
export class AiService {
  private readonly openaiKey = process.env.OPENAI_API_KEY;
  private readonly openai = this.openaiKey ? new OpenAI({ apiKey: this.openaiKey }) : null;

  constructor(@InjectRepository(Task) private readonly tasksRepo: Repository<Task>) {}

  async suggestDailyPlan(userId: string): Promise<AiPlanResponse> {
    const tasks = await this.tasksRepo.find({ where: { ownerId: userId }, order: { createdAt: "ASC" } });
    if (this.openai) {
      return this.callOpenAi(tasks);
    }
    return this.buildDeterministicStub(tasks);
  }

  private async callOpenAi(tasks: Task[]): Promise<AiPlanResponse> {
    const prompt = `You are an engineering assistant. Given the user's tasks (status, title, minutes):\n${tasks
      .map((t) => `- [${t.status}] ${t.title} (${t.totalMinutes}m)`) 
      .join("\n")}\nReturn a concise JSON with {summary, priorities[3], blocks[3]}.`;

    const content = [{ type: "text" as const, text: prompt }];
    const res = await this.openai!.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content } as any],
      temperature: 0.2,
    });
    const text = res.choices?.[0]?.message?.content ?? "";
    try {
      const parsed = JSON.parse(text) as AiPlanResponse;
      return parsed;
    } catch {
      return this.buildDeterministicStub(tasks);
    }
  }

  private buildDeterministicStub(tasks: Task[]): AiPlanResponse {
    const byStatus: Record<TaskStatus, Task[]> = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.DONE]: [],
    };
    for (const t of tasks) byStatus[t.status].push(t);

    const priorities = [...byStatus.IN_PROGRESS, ...byStatus.TODO]
      .slice(0, 3)
      .map((t) => ({ taskId: t.id, title: t.title, reason: t.status === TaskStatus.IN_PROGRESS ? "Already in motion" : "High impact next" }));

    const blocks: AiPlanBlock[] = [
      { label: "09:00-11:00", focus: priorities[0]?.title ?? "Deep work" },
      { label: "11:30-13:00", focus: priorities[1]?.title ?? "Unblock reviews" },
      { label: "14:00-15:30", focus: priorities[2]?.title ?? "Finish and buffer" },
    ];

    return {
      summary: `Focus on ${priorities.length} key items to drive progress today.`,
      priorities,
      blocks,
    };
  }
}
