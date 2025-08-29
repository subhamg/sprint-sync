import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request, Response } from "express";
import { JwtAuthGuard } from "./jwt.guard";
import bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { Public } from "../../decorators/public.decorator";
import { LoginDto } from "./dtos/login.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  @Public()
  @Post("register")
  async register(
    @Body() body: { email: string; name: string; password: string },
  ) {
    if (process.env.NODE_ENV === "production") {
      throw new ForbiddenException("Registration is disabled in production");
    }
    const exists = await this.users.findByEmail(body.email);
    if (exists) throw new BadRequestException("Email already in use");
    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await this.users.createUser({
      email: body.email,
      name: body.name,
      passwordHash,
      isAdmin: false,
    });
    return { id: user.id, email: user.email };
  }

  @Public()
  @Post("login")
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post("logout")
  async logout() {
    // No-op in bearer mode
    return { ok: true };
  }

  @Get("me")
  async me(@Req() req: Request) {
    return {
      userId: (req as any).user.sub,
      isAdmin: (req as any).user.isAdmin === true,
      name: (req as any).user.name,
    };
  }
}
