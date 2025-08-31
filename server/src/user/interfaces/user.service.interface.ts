import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { SearchUserDto } from '../dto/search-user.dto';

export interface IUserService {
  findAll(
    page: number,
    limit: number,
  ): Promise<{
    data: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
  }>;

  findOne(id: number): Promise<UserResponseDto>;

  create(userData: CreateUserDto): Promise<UserResponseDto>;

  update(id: number, userData: UpdateUserDto): Promise<UserResponseDto>;

  delete(id: number): Promise<void>;

  search(query: SearchUserDto): Promise<UserResponseDto[]>;
}
