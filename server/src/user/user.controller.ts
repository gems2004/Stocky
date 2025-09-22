import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
  Inject,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ApiResponseHelper } from '../common/helpers/api-response.helper';
import { SuccessResponse } from '../common/types/api-response.type';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/roles.decorator';
import { UserRole } from './entity/user.entity';
import { AppReadyGuard } from '../dynamic-database/guards/app-ready.guard';
import { AdminSetupGuard } from '../auth/guards/admin-setup.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Get('search')
  @UseGuards(AppReadyGuard, AuthGuard, RoleGuard)
  @Role(UserRole.ADMIN, UserRole.CASHIER)
  async search(
    @Query() searchUserDto: SearchUserDto,
  ): Promise<SuccessResponse<UserResponseDto[]>> {
    const users = await this.userService.search(searchUserDto);
    return ApiResponseHelper.success(
      users,
      'Users search completed successfully',
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  @UseGuards(AppReadyGuard, AuthGuard, RoleGuard)
  @Role(UserRole.ADMIN, UserRole.CASHIER)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<
    SuccessResponse<{
      data: UserResponseDto[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    // Parse page and limit with default values
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const result = await this.userService.findAll(pageNum, limitNum);
    return ApiResponseHelper.success(result, 'Users retrieved successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @UseGuards(AppReadyGuard, AuthGuard, RoleGuard)
  @Role(UserRole.ADMIN, UserRole.CASHIER)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<UserResponseDto>> {
    const user = await this.userService.findOne(id);
    return ApiResponseHelper.success(user, 'User retrieved successfully');
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @UseGuards(AdminSetupGuard)
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<SuccessResponse<UserResponseDto>> {
    const user = await this.userService.create(createUserDto);
    return ApiResponseHelper.success(user, 'User created successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  @UseGuards(AppReadyGuard, AuthGuard, RoleGuard)
  @Role(UserRole.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<SuccessResponse<UserResponseDto>> {
    const user = await this.userService.update(id, updateUserDto);
    return ApiResponseHelper.success(user, 'User updated successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  @UseGuards(AppReadyGuard, AuthGuard, RoleGuard)
  @Role(UserRole.ADMIN)
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    await this.userService.delete(id);
    return ApiResponseHelper.success(null, 'User deleted successfully');
  }
}
