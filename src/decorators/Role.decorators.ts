import { SetMetadata } from '@nestjs/common';
import { Role as UserRole } from 'src/entites/user.entity';

export const Role_Key = 'roles';

export const Role = (...roles: UserRole[]) => SetMetadata(Role_Key, roles);
