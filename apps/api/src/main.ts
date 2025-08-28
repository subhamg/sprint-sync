import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { RequestIdMiddleware } from "./common/logging/request-id.middleware";
import { Logger, LoggerErrorInterceptor } from "nestjs-pino";
import { LatencyLoggingInterceptor } from "./common/logging/latency.interceptor";
import { GlobalHttpExceptionFilter } from "./common/logging/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  app.use(cookieParser());
  app.use(new RequestIdMiddleware().use as any);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new LoggerErrorInterceptor(), app.get(LatencyLoggingInterceptor));
  app.useGlobalFilters(app.get(GlobalHttpExceptionFilter));

  app.enableCors({
    origin: process.env.WEB_ORIGIN || "http://localhost:3000",
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle("SprintSync API")
    .setDescription("API docs")
    .setVersion("1.0")
    .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" })
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/docs", app, documentFactory);

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 4000);
}

bootstrap();
