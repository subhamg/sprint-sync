import { Controller, Post, Req, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { AiService } from "./ai.service";
import { Request } from "express";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("AI")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("ai")
export class AiController {
  constructor(private readonly ai: AiService) {}

  @ApiOperation({ summary: "Get AI daily plan suggestions" })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        summary: "Focus on 3 key items to unblock Project X.",
        priorities: [
          { taskId: "uuid", title: "Implement OAuth", reason: "Critical path" },
          {
            taskId: "uuid",
            title: "Fix rate limiter bug",
            reason: "Customer impact",
          },
          { taskId: "uuid", title: "Add e2e tests", reason: "Stability" },
        ],
        blocks: [
          { label: "09:00-11:00", focus: "OAuth + callback flow" },
          { label: "11:30-13:00", focus: "Bugfix & regression" },
          { label: "14:00-15:30", focus: "Write e2e tests" },
        ],
      },
    },
  })
  @ApiResponse({ status: 429, description: "Rate limited" })
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("suggest")
  async suggest(@Req() req: Request) {
    const user = req.user as any;
    return this.ai.suggestDailyPlan(user.sub);
  }
}
