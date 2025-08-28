import { SuccessResponse } from '../types/api-response.type';

export class ApiResponseHelper {
  static success<T>(data: T, message?: string): SuccessResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }
}
