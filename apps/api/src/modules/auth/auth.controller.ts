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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Public } from "../../decorators/public.decorator";
import { LoginDto } from "./dtos/login.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  @Public()
  @ApiOperation({ summary: "Register (disabled in production)" })
  @ApiBody({
    schema: {
      example: {
        email: "demo@sprintsync.dev",
        name: "Demo User",
        password: "password123",
      },
    },
  })
  @ApiResponse({
    status: 201,
    schema: { example: { id: "uuid", email: "demo@sprintsync.dev" } },
  })
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
  @ApiOperation({ summary: "Login and receive Bearer token" })
  @ApiBody({
    schema: {
      example: { email: "demo@sprintsync.dev", password: "password123" },
    },
  })
  @ApiResponse({
    status: 200,
    schema: { example: { accessToken: "<jwt>", tokenType: "Bearer" } },
  })
  @Post("login")
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @ApiOperation({ summary: "Logout (no-op for Bearer)" })
  @ApiResponse({ status: 200, schema: { example: { ok: true } } })
  @Post("logout")
  async logout() {
    // No-op in bearer mode
    return { ok: true };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Current user" })
  @ApiResponse({
    status: 200,
    schema: { example: { userId: "uuid", isAdmin: false } },
  })
  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@Req() req: Request) {
    return {
      userId: (req as any).user.sub,
      isAdmin: (req as any).user.isAdmin === true,
      name: (req as any).user.name,
    };
  }
}
