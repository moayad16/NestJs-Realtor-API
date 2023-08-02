import { userType } from '@prisma/client';
import { SetMetadata } from '@nestjs/common';

export const role = (...roles: userType[]) => SetMetadata('roles', roles);


