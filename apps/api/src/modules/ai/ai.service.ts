import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import OpenAI from "openai";
import { Task, TaskStatus } from "../../entities/task.entity";

export interface AiPlanPriority {
  taskId: string;
  title: string;
  reason: string;
}
export interface AiPlanBlock {
  label: string; // "HH:MM-HH:MM" (24h)
  focus: string; // short, action-oriented
}
export interface AiPlanResponse {
  summary: string; // 1–2 sentences, <160 chars
  priorities: AiPlanPriority[]; // up to 3
  blocks: AiPlanBlock[]; // AI-chosen (2–5 typical), validated but not synthesized
}

@Injectable()
export class AiService {
  private readonly openaiKey = process.env.OPENAI_API_KEY;
  private readonly model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  private readonly openai = this.openaiKey
    ? new OpenAI({ apiKey: this.openaiKey })
    : null;

  constructor(
    @InjectRepository(Task) private readonly tasksRepo: Repository<Task>,
  ) {}

  async suggestDailyPlan(userId: string): Promise<AiPlanResponse> {
    const tasks = await this.tasksRepo.find({
      where: { ownerId: userId },
      order: { createdAt: "ASC" },
    });

    // Helpful empty state (deterministic)
    if (!tasks?.length) {
      return {
        summary: "No tasks yet—sketch a backlog and start one meaningful item.",
        priorities: [],
        blocks: [
          { label: "09:30-10:30", focus: "Backlog: list top 5 tasks" },
          { label: "11:00-12:00", focus: "Create first task and start" },
          { label: "14:00-15:00", focus: "Document and review" },
        ],
      };
    }

    if (this.openai) {
      try {
        const ai = await this.callOpenAi(tasks);
        const validated = this.validateAiPlan(ai);
        if (validated) return validated;
      } catch {
        // swallow and fall through to stub
      }
    }

    return this.buildDeterministicStub(tasks);
  }

  // ---- LLM call ----

  private async callOpenAi(tasks: Task[]): Promise<AiPlanResponse> {
    const now = new Date();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    const taskLines = tasks
      .map(
        (t) =>
          `- id:${t.id} status:${t.status} title:${this.truncate(t.title, 120)} timeMs:${t.totalMilliseconds ?? 0}`,
      )
      .join("\n");

    const system = [
      "You are SprintSync, an engineering planning assistant.",
      "Return a concise plan as VALID JSON only — no extra text, no markdown.",
    ].join(" ");

    const rules = [
      "Choose up to 3 priorities (favor IN_PROGRESS > TODO; ignore DONE).",
      "Write a 1–2 sentence summary (<160 chars).",
      "Decide 2–5 time blocks for TODAY in local time.",
      "Each block label MUST be 'HH:MM-HH:MM' (24h).",
      "Blocks must be chronological, non-overlapping, and within 08:00–19:00.",
      "Prefer 60–90 min focus with 15–30 min buffers.",
      "If tasks are short or fragmented, use more, shorter blocks.",
      "Output JSON ONLY matching the schema. No prose.",
    ].join(" ");

    const schema = {
      type: "object",
      required: ["summary", "priorities", "blocks"],
      properties: {
        summary: { type: "string" },
        priorities: {
          type: "array",
          maxItems: 3,
          items: {
            type: "object",
            required: ["taskId", "title", "reason"],
            properties: {
              taskId: { type: "string" },
              title: { type: "string" },
              reason: { type: "string" },
            },
          },
        },
        blocks: {
          type: "array",
          minItems: 1, // accept 1+ if model insists; we won't synthesize
          maxItems: 7, // soft cap; validator will clamp
          items: {
            type: "object",
            required: ["label", "focus"],
            properties: {
              label: {
                type: "string",
                description: "Format 'HH:MM-HH:MM' (24h, local)",
              },
              focus: { type: "string" },
            },
          },
        },
      },
      additionalProperties: false,
    };

    const userPrompt = [
      `<now time="${now.toISOString()}" tz="${tz}" />`,
      "User tasks:",
      taskLines,
      "",
      "Rules:",
      rules,
      "",
      "JSON schema:",
      JSON.stringify(schema),
    ].join("\n");

    const res = await this.openai!.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 500,
      // If supported by your SDK/model, uncomment for strict JSON:
      // response_format: { type: "json_object" },
    });

    const raw = res.choices?.[0]?.message?.content ?? "";
    return this.extractJson(raw) as AiPlanResponse;
  }

  // ---- Validation & helpers ----

  private validateAiPlan(plan: any): AiPlanResponse | null {
    if (!plan || typeof plan !== "object") return null;

    const summary = this.truncate(String(plan.summary ?? ""), 160).trim();
    if (!summary) return null;

    const priorities: AiPlanPriority[] = (
      Array.isArray(plan.priorities) ? plan.priorities : []
    )
      .slice(0, 3)
      .map((p: any) => ({
        taskId: String(p?.taskId ?? ""),
        title: this.truncate(String(p?.title ?? ""), 80),
        reason: this.truncate(String(p?.reason ?? ""), 80),
      }))
      .filter((p: any) => p.taskId && p.title && p.reason);

    const blocksRaw: any[] = Array.isArray(plan.blocks) ? plan.blocks : [];
    const blocksParsed = blocksRaw.map((b) => ({
      label: String(b?.label ?? ""),
      focus: this.truncate(String(b?.focus ?? ""), 80),
    }));

    const blocks = this.validateBlocks(blocksParsed);

    if (!priorities.length && !blocks.length) return null;

    return { summary, priorities, blocks };
  }

  private validateBlocks(blocks: AiPlanBlock[]): AiPlanBlock[] {
    // format HH:MM-HH:MM, 24h, within 08:00–19:00, chronological, no overlaps
    const re = /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/;
    const toMin = (hh: string, mm: string) =>
      parseInt(hh, 10) * 60 + parseInt(mm, 10);
    const withinDay = (m: number) => m >= 8 * 60 && m <= 19 * 60;

    const parsed = blocks
      .map((b) => {
        const m = b.label.match(re);
        if (!m) return null;
        const start = toMin(m[1], m[2]);
        const end = toMin(m[3], m[4]);
        if (!(start < end && withinDay(start) && withinDay(end))) return null;
        return { ...b, _start: start, _end: end };
      })
      .filter(Boolean) as (AiPlanBlock & { _start: number; _end: number })[];

    parsed.sort((a, b) => a._start - b._start);

    // remove overlaps
    const dedup: (AiPlanBlock & { _start: number; _end: number })[] = [];
    for (const b of parsed) {
      if (!dedup.length || b._start >= dedup[dedup.length - 1]._end)
        dedup.push(b);
    }

    // clamp to 2–5 if possible (but accept 1 valid block rather than synthesize)
    const clamped = dedup.slice(0, 5);
    return clamped.map(({ _start, _end, ...rest }) => rest);
  }

  private extractJson(text: string): unknown {
    // Strip code fences if present
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const candidate = fenced ? fenced[1] : text;

    // Find the first balanced JSON object
    const start = candidate.indexOf("{");
    if (start === -1) throw new Error("No JSON object found");
    let depth = 0;
    for (let i = start; i < candidate.length; i++) {
      const ch = candidate[i];
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          const slice = candidate.slice(start, i + 1);
          return JSON.parse(slice);
        }
      }
    }
    throw new Error("Unbalanced JSON in model output");
  }

  private truncate(s: string, n: number) {
    return s && s.length > n ? `${s.slice(0, n - 1)}…` : s;
  }

  // ---- Deterministic fallback ----

  private buildDeterministicStub(tasks: Task[]): AiPlanResponse {
    const inProg = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS);
    const todos = tasks.filter((t) => t.status === TaskStatus.TODO);
    const top = [...inProg, ...todos].slice(0, 3);

    const priorities: AiPlanPriority[] = top.map((t) => ({
      taskId: String(t.id),
      title: this.truncate(t.title, 80),
      reason:
        t.status === TaskStatus.IN_PROGRESS
          ? "Already in motion"
          : "Highest leverage next",
    }));

    // Deterministic timeboxes only when LLM fails entirely
    const blocks: AiPlanBlock[] = [
      { label: "09:00-10:30", focus: priorities[0]?.title ?? "Deep work" },
      {
        label: "11:00-12:30",
        focus: priorities[1]?.title ?? "Reviews & unblock",
      },
      {
        label: "14:00-15:30",
        focus: priorities[2]?.title ?? "Finish & buffer",
      },
    ];

    return {
      summary:
        "Advance 2–3 key items; protect a deep-work block and wrap with documentation.",
      priorities,
      blocks,
    };
  }
}
