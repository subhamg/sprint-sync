import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from "class-validator";
import { TaskStatus } from "../../entities/task.entity";

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsUUID()
  ownerId?: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsUUID()
  ownerId?: string;
}

export class UpdateStatusDto {
  @IsEnum(TaskStatus)
  nextStatus!: TaskStatus;
}

export class LogTimeDto {
  @IsInt()
  @Min(1)
  minutes!: number;
}
