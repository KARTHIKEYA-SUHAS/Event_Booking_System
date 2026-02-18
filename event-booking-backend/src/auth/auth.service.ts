import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../users/user.model';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private jwtService: JwtService,
  ) {}

  // 🔐 Register
  async register(data: RegisterDto) {
    const { name, email, password } = data;

    const existingUser = await this.userModel.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      role: UserRole.USER,
    });

    const plainUser = createdUser.get({ plain: true });
    const { password: _removed, ...result } = plainUser;

    return result;
  }

  // 🔑 Login
  async login(email: string, password: string) {
    const user = await this.userModel.findOne({
      where: { email },
      attributes: { include: ['password'] }, // keep this
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
