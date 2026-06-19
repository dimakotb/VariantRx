import mockVariantsData from '@/data/mockVariants.json';
import type { ApiResponse, Variant } from '@/types';

const MOCK_VARIANTS = mockVariantsData as Variant[];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function searchMockVariants(query: string): Variant[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return MOCK_VARIANTS.filter(
    (v) =>
      v.rsid.toLowerCase().includes(q) ||
      v.gene.toLowerCase().includes(q) ||
      v.desc.toLowerCase().includes(q) ||
      (v.drugs ?? []).some((d) => d.n.toLowerCase().includes(q)),
  );
}

export async function mockSearchVariants(
  query: string,
): Promise<ApiResponse<Variant[]>> {
  await delay(280);
  return { success: true, data: searchMockVariants(query) };
}

export function getMockVariantByRsid(rsid: string): Variant | undefined {
  return MOCK_VARIANTS.find((v) => v.rsid === rsid);
}

export { MOCK_VARIANTS };
