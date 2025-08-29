import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { TasksService } from "./tasks.service";
import {
  CreateTaskDto,
  LogTimeDto,
  UpdateStatusDto,
  UpdateTaskDto,
} from "./dtos";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { AdminGuard } from "../auth/admin.guard";
import { Request } from "express";

@UseGuards(JwtAuthGuard)
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  async list(@Req() req: Request, @Query("all") all?: string) {
    const user = req.user as any;
    const isAdmin = user?.isAdmin === true; // user payload currently only has sub; adjust if extended
    return this.tasks.listForUser(user.sub, isAdmin, all === "true");
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateTaskDto) {
    const user = req.user as any;
    const isAdmin = user?.isAdmin === true;
    return this.tasks.create(dto, user.sub, isAdmin);
  }

  @Get(":id")
  async get(@Req() req: Request, @Param("id") id: string) {
    const user = req.user as any;
    const isAdmin = user?.isAdmin === true;
    return this.tasks.getById(id, user.sub, isAdmin);
  }

  @Put(":id")
  async update(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const user = req.user as any;
    const isAdmin = user?.isAdmin === true;
    return this.tasks.update(id, dto, user.sub, isAdmin);
  }

  @Patch(":id/status")
  async updateStatus(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    const user = req.user as any;
    const isAdmin = user?.isAdmin === true;
    return this.tasks.updateStatus(id, dto, user.sub, isAdmin);
  }

  @Post(":id/start-timer")
  async startTimer(@Req() req: Request, @Param("id") id: string) {
    const user = req.user as any;
    const isAdmin = user?.isAdmin === true;
    return this.tasks.startTimer(id, user.sub, isAdmin);
  }

  @Post(":id/stop-timer")
  async stopTimer(@Req() req: Request, @Param("id") id: string) {
    const user = req.user as any;
    const isAdmin = user?.isAdmin === true;
    return this.tasks.stopTimer(id, user.sub, isAdmin);
  }

  @UseGuards(AdminGuard)
  @Delete(":id")
  async remove(@Param("id") id: string) {
    // Admin only
    return this.tasks.delete(id, "", true);
  }
}
