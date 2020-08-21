import { model, property } from '@loopback/repository';

export type ApiResponseStatus = 'success' | 'error';

@model()
export class SimpleApiResponse {
  @property() status: ApiResponseStatus;
  @property() error?: string;
}