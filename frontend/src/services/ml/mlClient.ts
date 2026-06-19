import { env } from '@/config/env';
import { apiPost } from '@/services/api/client';
import type { ApiResponse } from '@/types';
import type { MlApiErrorBody } from '@/types/ml.types';

export interface MlRequestOptions {
  signal?: AbortSignal;
  /** Override base URL when ML service is deployed separately from main API */
  baseUrl?: string;
}

/**
 * Generic handler for ML inference HTTP calls.
 * Swap implementation details here when moving to FastAPI / dedicated ML service.
 */
export async function mlPost<TResponse, TBody>(
  endpoint: string,
  body: TBody,
  options: MlRequestOptions = {},
): Promise<TResponse> {
  const url = options.baseUrl ? `${options.baseUrl}${endpoint}` : endpoint;

  const response = await apiPost<ApiResponse<TResponse> | MlApiErrorBody, TBody>(
    url,
    body,
    options.signal ? { signal: options.signal } : undefined,
  );

  if ('success' in response && response.success === false) {
    throw new Error('message' in response ? response.message : 'ML inference failed');
  }

  if ('success' in response && response.success && 'data' in response) {
    return response.data;
  }

  return response as TResponse;
}

export const mlClientConfig = {
  baseUrl: env.apiBaseUrl,
  useMock: env.useMockApi,
} as const;
