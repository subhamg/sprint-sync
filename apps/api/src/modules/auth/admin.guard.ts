import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly users: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user as { sub?: string } | undefined;
    if (!user?.sub) throw new UnauthorizedException();
    const dbUser = await this.users.findById(user.sub);
    if (!dbUser?.isAdmin) throw new ForbiddenException("Admin only");
    return true;
  }
}
