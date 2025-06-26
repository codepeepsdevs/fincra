import {
  ConflictException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from 'src/common/events/userCreatedEvent';
import { UserSerializer } from 'src/common/serializers/user.serializer';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignUpDto) {
    const { fullname, email, password } = signupDto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      throw new ConflictException('User with email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        fullname,
        email,
        password: hashedPassword,
      },
    });

    this.eventEmitter.emitAsync(
      'user.created',
      new UserCreatedEvent(newUser.id),
    );

    return {
      message: 'User created successfully',
      statusCode: HttpStatus.CREATED,
      user: new UserSerializer(newUser),
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
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
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      statusCode: HttpStatus.OK,
      data: {
        user: new UserSerializer(user),
        token,
      },
    };
  }
}
