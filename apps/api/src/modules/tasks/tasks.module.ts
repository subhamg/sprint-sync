import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Task } from "../../entities/task.entity";
import { TimeLog } from "../../entities/time-log.entity";
import { TasksService } from "./tasks.service";
import { TasksController } from "./tasks.controller";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [TypeOrmModule.forFeature([Task, TimeLog]), UsersModule],
  providers: [TasksService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
