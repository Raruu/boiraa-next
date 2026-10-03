export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  total: number;
  perPage: number;
  lastPage: number;
  nextPage: number | null;
  previousPage: number | null;
  statusCode: number;
  message: string;
};

export type ApiSingleResponse<T> = {
  data: T;
  statusCode: number;
  message: string;
};

export type ValidationErrorDetail = {
  rule: string;
  field: string;
  message: string;
};

export type ApiValidationError = {
  statusCode: number;
  message: string;
  errors: ValidationErrorDetail[];
};

export type QueryParams = {
  page?: number;
  limit?: number;
  sort?: string;
  search?:
    | string
    | {
        fields: string;
        value: string;
      };
  filter?: Record<string, Record<string, string | number | boolean>>;
};
