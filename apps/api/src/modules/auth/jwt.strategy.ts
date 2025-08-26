import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";

function cookieExtractor(req: Request): string | null {
  if (!req || !req.cookies) return null;
  return req.cookies["ss_access"] || null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: process.env.JWT_SECRET || "dev-secret",
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
