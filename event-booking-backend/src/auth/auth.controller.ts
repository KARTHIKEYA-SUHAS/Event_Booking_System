import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './register.dto';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { UserRole } from 'src/users/user.model';
import { LoginDto } from './login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() data: LoginDto) {
    return this.authService.login(data.email, data.password);
  }

  // 🔒 Protected Route
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(
    @Request()
    req: {
      user: {
        userId: string;
        email: string;
        role: string;
      };
    },
  ) {
    return req.user;
  }
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @Get('admin-area')
  getAdminArea() {
    return { message: 'Welcome to admin/organizer area' };
  }
}
