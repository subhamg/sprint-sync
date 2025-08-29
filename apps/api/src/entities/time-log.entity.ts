import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Task } from "./task.entity";
import { User } from "./user.entity";

@Entity({ name: "time_logs" })
export class TimeLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Task, { nullable: false, onDelete: "CASCADE" })
  task!: Task;

  @Column({ type: "uuid" })
  taskId!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  user!: User;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "integer" })
  milliseconds!: number;

  // Denormalized yyyy-mm-dd (UTC) for fast grouping
  @Column({ type: "varchar", length: 10 })
  day!: string;

  @CreateDateColumn({ type: process.env.NODE_ENV === "test" ? "datetime" : "timestamptz" })
  createdAt!: Date;
}


