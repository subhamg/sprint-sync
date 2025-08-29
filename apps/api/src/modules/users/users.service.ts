import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  async createUser(params: {
    email: string;
    name: string;
    passwordHash: string;
    isAdmin?: boolean;
  }) {
    const user = this.usersRepo.create({
      email: params.email,
      name: params.name,
      passwordHash: params.passwordHash,
      isAdmin: !!params.isAdmin,
    });
    return this.usersRepo.save(user);
  }
}
