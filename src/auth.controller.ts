import { Controller, Get, Post, Body, Headers, HttpCode, HttpStatus, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

const USER_STORE = new Map<string, string>(); // In-memory store: email -> hashedPassword

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: { email: string; pass: string }) {
    if (USER_STORE.has(dto.email)) {
      throw new ConflictException('User already registered');
    }
    const hash = await bcrypt.hash(dto.pass, 10);
    USER_STORE.set(dto.email, hash);
    return { status: 'success', message: 'User registered' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: { email: string; pass: string }) {
    const hash = USER_STORE.get(dto.email);
    if (!hash || !(await bcrypt.compare(dto.pass, hash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.jwtService.sign({ sub: dto.email });
    return {
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: 3600,
    };
  }

  @Post('profile')
  @HttpCode(HttpStatus.OK)
  async profile(@Body() _body: any, @Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(token);
      return { status: 'success', user: decoded.sub };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}