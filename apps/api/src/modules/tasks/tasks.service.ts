import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Task, TaskStatus } from "../../entities/task.entity";
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
  ) {}

  async listForUser(userId: string, isAdmin: boolean, all?: boolean) {
    if (isAdmin && all) {
      return this.tasksRepo.find({ order: { createdAt: "DESC" } });
    }
    return this.tasksRepo.find({
      where: { ownerId: userId },
      order: { createdAt: "DESC" },
    });
  }

  async getById(id: string, userId: string, isAdmin: boolean) {
    const task = await this.tasksRepo.findOne({ where: { id } });
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
      totalMinutes: 0,
      ownerId,
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

  canTransition(current: TaskStatus, next: TaskStatus) {
    if (current === TaskStatus.TODO) return next === TaskStatus.IN_PROGRESS;
    if (current === TaskStatus.IN_PROGRESS) return next === TaskStatus.DONE;
    return false;
  }

  async updateStatus(
    id: string,
    dto: UpdateStatusDto,
    userId: string,
    isAdmin: boolean,
  ) {
    const task = await this.getById(id, userId, isAdmin);
    if (!this.canTransition(task.status, dto.nextStatus)) {
      throw new ForbiddenException("Illegal status transition");
    }
    task.status = dto.nextStatus;
    return this.tasksRepo.save(task);
  }

  async logTime(id: string, dto: LogTimeDto, userId: string, isAdmin: boolean) {
    const task = await this.getById(id, userId, isAdmin);
    task.totalMinutes += dto.minutes;
    return this.tasksRepo.save(task);
  }
}
