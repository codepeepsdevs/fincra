import { User } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class UserSerializer {
  @Expose()
  id: number;

  @Expose()
  fullname: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
