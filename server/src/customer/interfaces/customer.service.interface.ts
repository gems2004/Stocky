import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomerResponseDto } from '../dto/customer-response.dto';

export interface ICustomerService {
  create(createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto>;
  findAll(): Promise<CustomerResponseDto[]>;
  update(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto>;
  remove(id: number): Promise<void>;
}
