import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User, UserRole } from './user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async updateRole(id: string, role: UserRole) {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = role;
    await user.save();

    return {
      message: 'User role updated successfully',
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
