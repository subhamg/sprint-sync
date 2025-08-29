import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";

type JwtPayload = {
  sub: string;
  email: string;
  isAdmin: boolean;
  name: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException("Invalid credentials");
    const tokens = await this.issueTokens(
      user.id,
      user.email,
      user.isAdmin,
      user.name,
    );
    return {
      user: { id: user.id, email: user.email, isAdmin: user.isAdmin },
      ...tokens,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    console.log("user", user);
    if (!user) throw new UnauthorizedException();
    const ok = await bcrypt.compare(password, user.passwordHash);
    console.log("ok", ok);
    if (!ok) throw new UnauthorizedException();
    return user;
  }

  private async issueTokens(
    sub: string,
    email: string,
    isAdmin: boolean,
    name: string,
  ) {
    const payload: JwtPayload = { sub, email, isAdmin, name };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET!,
      expiresIn: "15m",
    });
    const refreshToken = await this.jwt.signAsync(
      { sub, email, isAdmin, name },
      {
        secret: process.env.JWT_REFRESH_SECRET!,
        expiresIn: "7d",
      },
    );
    return { accessToken, refreshToken };
  }
}
