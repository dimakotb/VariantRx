import { env } from '@/config/env';
import { apiGet } from '@/services/api/client';
import { mockSearchVariants } from '@/services/mock/variantSearch';
import type { ApiResponse, Variant } from '@/types';

export async function searchVariants(
  query: string,
  model?: 'pathnet' | 'drugnet',
): Promise<Variant[]> {
  if (env.useMockApi) {
    const res = await mockSearchVariants(query);
    let data = res.data;
    if (model === 'drugnet') {
      data = data.filter((v) => v.hasDrug || v.drugnetEligible);
    }
    return data;
  }

  const modelParam = model ? `&model=${model}` : '';

  const res = await apiGet<ApiResponse<Variant[]>>(
    `/variants?search=${encodeURIComponent(query)}${modelParam}`,
  );
  return res.success ? res.data : [];
}
