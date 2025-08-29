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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("Tasks")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @ApiOperation({ summary: "List my tasks (admin can pass all=true)" })
  @ApiQuery({ name: "all", required: false, schema: { default: false } })
  @ApiResponse({ status: 200, description: "Array of tasks" })
  @Get()
  async list(@Req() req: Request, @Query("all") all?: string) {
    const user = req.user as any;
    const isAdmin = user?.isAdmin === true;
    return this.tasks.listForUser(user.sub, isAdmin, all === "true");
  }

  @ApiOperation({ summary: "Create task" })
  @ApiBody({
    schema: { example: { title: "Build login", description: "Mantine form" } },
  })
  @ApiResponse({ status: 201 })
  @Post()
  async create(@Req() req: Request, @Body() dto: CreateTaskDto) {
    const user = req.user as any;
    const isAdmin = user?.isAdmin === true;
    return this.tasks.create(dto, user.sub, isAdmin);
  }

  @ApiOperation({ summary: "Get task by id" })
  @ApiResponse({ status: 404, description: "Task not found" })
  @Get(":id")
  async get(@Req() req: Request, @Param("id") id: string) {
    const user = req.user as any;
    const isAdmin = user?.isAdmin === true;
    return this.tasks.getById(id, user.sub, isAdmin);
  }

  @ApiOperation({ summary: "Update task" })
  @ApiBody({
    schema: { example: { title: "New title", description: "Updated" } },
  })
  @ApiResponse({ status: 404, description: "Task not found" })
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

  @ApiOperation({ summary: "Update status (TODO→IN_PROGRESS→DONE)" })
  @ApiBody({ schema: { example: { nextStatus: "IN_PROGRESS" } } })
  @ApiResponse({ status: 400, description: "Illegal status transition" })
  @ApiResponse({ status: 404, description: "Task not found" })
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

  @ApiOperation({ summary: "Start timer" })
  @ApiResponse({ status: 400, description: "Timer already running" })
  @ApiResponse({ status: 404, description: "Task not found" })
  @Post(":id/start-timer")
  async startTimer(@Req() req: Request, @Param("id") id: string) {
    const user = req.user as any;
    const isAdmin = user?.isAdmin === true;
    return this.tasks.startTimer(id, user.sub, isAdmin);
  }

  @ApiOperation({ summary: "Stop timer (adds minutes)" })
  @ApiResponse({ status: 400, description: "Timer not running" })
  @ApiResponse({ status: 404, description: "Task not found" })
  @Post(":id/stop-timer")
  async stopTimer(@Req() req: Request, @Param("id") id: string) {
    const user = req.user as any;
    const isAdmin = user?.isAdmin === true;
    return this.tasks.stopTimer(id, user.sub, isAdmin);
  }

  @ApiOperation({ summary: "Delete task (admin only)" })
  @UseGuards(AdminGuard)
  @ApiResponse({ status: 404, description: "Task not found" })
  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.tasks.delete(id, "", true);
  }
}
