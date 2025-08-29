import { http } from "../lib/http";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface TaskDto {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  totalMilliseconds: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  isRunning?: boolean;
  startedAt?: string | null;
}

export class TasksService {
  async list(params?: { all?: boolean }) {
    const { data } = await http.get<TaskDto[]>("/tasks", { params });
    return data;
  }

  async create(payload: { title: string; description?: string | null }) {
    const { data } = await http.post<TaskDto>("/tasks", payload);
    return data;
  }

  async update(
    id: string,
    payload: { title?: string; description?: string | null },
  ) {
    const { data } = await http.put<TaskDto>(`/tasks/${id}`, payload);
    return data;
  }

  async remove(id: string) {
    await http.delete(`/tasks/${id}`);
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

  async startTimer(id: string) {
    const { data } = await http.post<{ ok: true; startedAt: string }>(
      `/tasks/${id}/start-timer`,
    );
    return data;
  }

  async stopTimer(id: string) {
    const { data } = await http.post<{ task: TaskDto; addedMinutes: number }>(
      `/tasks/${id}/stop-timer`,
    );
    return data;
  }
}

export const tasksService = new TasksService();
