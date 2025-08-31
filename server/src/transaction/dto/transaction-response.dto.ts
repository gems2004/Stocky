import { UserResponseDto } from '../../user/dto/user-response.dto';

class TransactionItemResponseDto {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export class TransactionResponseDto {
  id: number;
  customerId?: number;
  userId: number;
  user?: UserResponseDto;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  paymentMethod?: string;
  status: string;
  createdAt: Date;
  transactionItems: TransactionItemResponseDto[];
}
