import { ShopInfoDto } from '../../setup/dto/shop-info.dto';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import { DatabaseConfigDto } from '../../setup/dto/database-config.dto';

export class CombinedSettingsDto {
  user: UserResponseDto;
  shopInfo: ShopInfoDto | null;
  databaseConfig: DatabaseConfigDto | null;
}