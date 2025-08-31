import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import { SupplierResponseDto } from '../dto/supplier-response.dto';

export interface ISupplierService {
  create(createSupplierDto: CreateSupplierDto): Promise<SupplierResponseDto>;
  findAll(): Promise<SupplierResponseDto[]>;
  update(
    id: number,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<SupplierResponseDto>;
  remove(id: number): Promise<void>;
}