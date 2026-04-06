import { Body, Controller, Get, Post, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

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
}
