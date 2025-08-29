import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Task, TaskStatus } from "../../entities/task.entity";
import { TimeLog } from "../../entities/time-log.entity";
import {
  CreateTaskDto,
  LogTimeDto,
  UpdateStatusDto,
  UpdateTaskDto,
} from "./dtos";

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly tasksRepo: Repository<Task>,
    @InjectRepository(TimeLog)
    private readonly timeLogRepo: Repository<TimeLog>,
  ) {}

  async listForUser(userId: string, all?: boolean) {
    const tasks = all
      ? await this.tasksRepo.find({
          relations: ["owner"],
          order: { createdAt: "DESC" },
        })
      : await this.tasksRepo.find({
          where: { ownerId: userId },
          relations: ["owner"],
          order: { createdAt: "DESC" },
        });

    return tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      totalMilliseconds: t.totalMilliseconds,
      ownerId: t.ownerId,
      startedAt: t.startedAt,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      isRunning: !!t.startedAt,
      ownerName: t.owner?.name ?? null,
    }));
  }

  async getById(id: string, userId: string, isAdmin: boolean) {
    const task = await this.tasksRepo.findOneBy({ id });
    if (!task) throw new NotFoundException();
    if (!isAdmin && task.ownerId !== userId) throw new ForbiddenException();
    return task;
  }

  async create(dto: CreateTaskDto, userId: string, isAdmin: boolean) {
    const ownerId = isAdmin && dto.ownerId ? dto.ownerId : userId;
    const task = this.tasksRepo.create({
      title: dto.title,
      description: dto.description ?? null,
      status: TaskStatus.TODO,
      totalMilliseconds: 0,
      ownerId,
      startedAt: null,
    });
    return this.tasksRepo.save(task);
  }

  async update(
    id: string,
    dto: UpdateTaskDto,
    userId: string,
    isAdmin: boolean,
  ) {
    const task = await this.getById(id, userId, isAdmin);
    if (!isAdmin && dto.ownerId && dto.ownerId !== task.ownerId) {
      throw new ForbiddenException();
    }
    Object.assign(task, {
      title: dto.title ?? task.title,
      description: dto.description ?? task.description,
      ownerId: isAdmin && dto.ownerId ? dto.ownerId : task.ownerId,
    });
    return this.tasksRepo.save(task);
  }

  async delete(id: string, userId: string, isAdmin: boolean) {
    const task = await this.getById(id, userId, isAdmin);
    await this.tasksRepo.delete(task.id);
    return { ok: true };
  }

  async updateStatus(
    id: string,
    dto: UpdateStatusDto,
    userId: string,
    isAdmin: boolean,
  ) {
    const task = await this.getById(id, userId, isAdmin);
    // Allow any owner (or admin) to set arbitrary status
    task.status = dto.nextStatus;
    return this.tasksRepo.save(task);
  }

  async startTimer(id: string, userId: string, isAdmin: boolean) {
    const task = await this.getById(id, userId, isAdmin);
    if (task.startedAt) throw new ConflictException("Timer already running");
    task.startedAt = new Date();
    await this.tasksRepo.save(task);
    return { ok: true, startedAt: task.startedAt };
  }

  async stopTimer(id: string, userId: string, isAdmin: boolean) {
    const task = await this.getById(id, userId, isAdmin);
    if (!task.startedAt) throw new NotFoundException("No active timer");
    const ms = Date.now() - new Date(task.startedAt).getTime();
    task.totalMilliseconds += ms;
    task.startedAt = null;
    const saved = await this.tasksRepo.save(task);
    const day = new Date().toISOString().slice(0, 10);
    await this.timeLogRepo.save(
      this.timeLogRepo.create({
        taskId: task.id,
        userId,
        milliseconds: ms,
        day,
      }),
    );
    return { task: saved, addedMilliseconds: ms };
  }
}
