import { env } from '@/config/env';

/** Live API: predict via catalog rsid. Mock/demo: client-side features. */
export function shouldUseCatalogPredict(manualOverride: boolean): boolean {
  return !env.useMockApi && !manualOverride;
}

/** Manual override is allowed only in frontend-only mock mode. */
export function canPredictWithManualOverride(manualOverride: boolean): boolean {
  if (!manualOverride) return true;
  return env.useMockApi;
}

export function manualOverrideBlockedMessage(): string {
  return 'Manual input is demo-only. Search and select a variant from the inference catalog.';
}
