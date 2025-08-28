export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    technicalDetails?: string;
    timestamp: string;
    requestId?: string;
  };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
