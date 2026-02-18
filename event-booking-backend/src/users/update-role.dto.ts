import { IsEnum } from 'class-validator';
import { UserRole } from './user.model';

export class UpdateRoleDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsEnum(UserRole as object)
  role!: UserRole;
}
