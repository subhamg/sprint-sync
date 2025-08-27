import { http } from "../lib/http";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface TaskDto {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  totalMinutes: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export class TasksService {
  async list(params?: { all?: boolean }) {
    const { data } = await http.get<TaskDto[]>("/tasks", { params });
    return data;
  }

  async updateStatus(id: string, nextStatus: TaskStatus) {
    const { data } = await http.patch<TaskDto>(`/tasks/${id}/status`, {
      nextStatus,
    });
    return data;
  }

  async logTime(id: string, minutes: number) {
    const { data } = await http.post<TaskDto>(`/tasks/${id}/log-time`, {
      minutes,
    });
    return data;
  }
}

export const tasksService = new TasksService();
