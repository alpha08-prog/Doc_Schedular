export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: string;
  statusCode?: number;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type PaginatedResponse<T> = ApiSuccess<{
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}>;
