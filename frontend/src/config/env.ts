const useMock =
  import.meta.env.VITE_USE_MOCK_API === 'true' ||
  import.meta.env.VITE_USE_MOCK_API === '1';

export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? 'VariantRx',
  appTagline: 'Bioinformatics & Pharmacogenomics AI Platform',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  useMockApi: useMock,
  isDev: import.meta.env.DEV,
} as const;
