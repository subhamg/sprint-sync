import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Task } from "../../entities/task.entity";
import { AiService } from "./ai.service";
import { AiController } from "./ai.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  providers: [AiService],
  controllers: [AiController],
})
export class AiModule {}
