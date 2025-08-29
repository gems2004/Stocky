import { ShopInfoDto } from '../dto/shop-info.dto';
import { DatabaseConfigDto } from '../dto/database-config.dto';

export interface SetupConfig {
  isDatabaseConfigured: boolean;
  isShopConfigured: boolean;
  isAdminUserCreated: boolean;
  isSetupComplete: boolean;
  shopInfo?: ShopInfoDto;
  databaseConfig?: DatabaseConfigDto;
}
