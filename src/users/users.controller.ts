import { Body, Controller, Get, Post, Delete, Req, BadRequestException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  async register(@Body() dto: CreateUserDto) {
    await this.usersService.register(dto);
    return { data: 'OK' };
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

  @Get('current')
  @UseGuards(AuthGuard)
  async getCurrentUser(@CurrentUser() user: any) {
    return {
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    };
  }

  @Delete('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() request: any) {
    const authHeader = request.headers.authorization;
    const token = authHeader.split(' ')[1];

    await this.usersService.logout(token);

    return { data: 'OK' };
  }
}
