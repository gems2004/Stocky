import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    private readonly technicalDetails?: string,
  ) {
    super(message, status);
  }

  getTechnicalDetails(): string | undefined {
    return this.technicalDetails;
  }
}
