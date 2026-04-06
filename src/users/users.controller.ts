import { Body, Controller, Get, Post, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  async register(@Body() dto: CreateUserDto) {
    try {
      await this.usersService.register(dto);
      return { data: 'OK' };
    } catch (error) {
      throw new BadRequestException({
        error: 'Email sudah terdaftar atau password invalid',
      });
    }
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    try {
      const token = await this.usersService.login(dto);
      return { data: token };
    } catch (error) {
      throw new UnauthorizedException({
        error: 'Email atau password salah',
      });
    }
  }
}
