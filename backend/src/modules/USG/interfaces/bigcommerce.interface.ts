export interface IBigCommerceFetchInput {
  method?: 'GET' | 'PUT' | 'POST' | 'DELETE';
  resource: string;
  apiVersion?: 'v2' | 'v3';
  query?: Record<string, string | number>;
  body?: Object;
}
