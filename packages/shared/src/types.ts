export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export interface TaskDto {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  totalMilliseconds: number;
  startedAt: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}
