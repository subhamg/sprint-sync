import { Controller, Post, Req, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { AiService } from "./ai.service";
import { Request } from "express";

@UseGuards(JwtAuthGuard)
@Controller("ai")
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("suggest")
  async suggest(@Req() req: Request) {
    const user = req.user as any;
    return this.ai.suggestDailyPlan(user.sub);
  }
}
