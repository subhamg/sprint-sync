import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField("refreshToken"),
      secretOrKey: process.env.JWT_REFRESH_SECRET!,
      passReqToCallback: false,
    });
  }

  async validate(payload: { sub: string; email: string; name: string }) {
    if (!payload?.sub) throw new UnauthorizedException();
    return payload;
  }
}
