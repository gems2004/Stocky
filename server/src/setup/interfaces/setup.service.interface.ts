import { SetupStatusDto } from '../dto/setup-status.dto';
import { DatabaseConfigDto } from '../dto/database-config.dto';
import { ShopInfoDto } from '../dto/shop-info.dto';
import { AdminUserDto } from '../dto/admin-user.dto';

export interface ISetupService {
  getStatus(): Promise<SetupStatusDto>;
  configureDatabase(config: DatabaseConfigDto): Promise<SetupStatusDto>;
  configureShop(info: ShopInfoDto): SetupStatusDto;
  createAdminUser(userData: AdminUserDto): Promise<SetupStatusDto>;
  completeSetup(): SetupStatusDto;
}
