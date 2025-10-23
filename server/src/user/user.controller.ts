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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
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

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Get('search')
  @UseGuards(AppReadyGuard, AuthGuard, RoleGuard)
  @Role(UserRole.ADMIN, UserRole.CASHIER)
  @ApiOperation({ summary: 'Search users' })
  @ApiResponse({
    status: 200,
    description: 'Users search completed successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin or Cashier role required',
  })
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
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin or Cashier role required',
  })
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
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin or Cashier role required',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<UserResponseDto>> {
    const user = await this.userService.findOne(id);
    return ApiResponseHelper.success(user, 'User retrieved successfully');
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @UseGuards(AdminSetupGuard)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      example1: {
        summary: 'Sample user creation payload',
        value: {
          username: 'johndoe',
          email: 'john.doe@example.com',
          first_name: 'John',
          last_name: 'Doe',
          password: 'Password123!',
          role: 'cashier',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      example: {
        success: true,
        message: 'User created successfully',
        data: {
          id: 2,
          username: 'johndoe',
          email: 'john.doe@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'cashier',
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin setup required',
    schema: {
      example: {
        success: false,
        message: 'Admin setup is required before creating users',
        data: null,
      },
    },
  })
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
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      example1: {
        summary: 'Sample user update payload',
        value: {
          username: 'johndoe_updated',
          email: 'john.updated@example.com',
          first_name: 'John',
          last_name: 'Doe Updated',
          role: 'manager',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      example: {
        success: true,
        message: 'User updated successfully',
        data: {
          id: 2,
          username: 'johndoe_updated',
          email: 'john.updated@example.com',
          first_name: 'John',
          last_name: 'Doe Updated',
          role: 'manager',
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-02T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
    schema: {
      example: {
        success: false,
        message: 'Forbidden',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        success: false,
        message: 'User not found',
        data: null,
      },
    },
  })
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
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    await this.userService.delete(id);
    return ApiResponseHelper.success(null, 'User deleted successfully');
  }
}
