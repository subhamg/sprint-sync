import { z } from 'zod';
import { TaskStatus } from './types.js';

export const taskStatusSchema = z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE]);

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  ownerId: z.string().uuid().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  ownerId: z.string().uuid().optional(),
});

export const updateStatusSchema = z.object({
  nextStatus: taskStatusSchema,
});

export const logTimeSchema = z.object({
  minutes: z.number().int().positive(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
