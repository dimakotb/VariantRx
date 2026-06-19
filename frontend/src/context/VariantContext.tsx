import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { searchVariants } from '@/services/variantService';
import type { ModelTab, Variant } from '@/types';

const defaultManualVariant: Variant = {
  rsid: '',
  gene: '',
  chrom: '-',
  ref: '',
  alt: '',
  type: 'snv',
  path: 'Uncertain',
  drugResp: null,
  cpic: false,
  pgkb: false,
  hc: false,
  sub: 1,
  rev: 0,
  hasDrug: false,
  drugs: [],
  diseases: [],
  cat: 'tag-na',
  tag: 'Manual',
  src: [],
  desc: 'Manually defined variant. Run PathNet to generate pathogenicity predictions.',
};

interface VariantContextValue {
  variants: Variant[];
  selectedVariant: Variant | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  loading: boolean;
  error: string | null;
  manualOverride: boolean;
  setManualOverride: (v: boolean) => void;
  manualVariant: Variant;
  /** When set, filters catalog search (e.g. drugnet tab → PGx-eligible only) */
  searchModelFilter: ModelTab | undefined;
  setSearchModelFilter: (model: ModelTab | undefined) => void;
  selectVariant: (variant: Variant) => void;
  handleManualChange: (field: keyof Variant, value: unknown) => void;
  resetSelection: () => void;
}

const VariantContext = createContext<VariantContextValue | null>(null);

export function useVariant(): VariantContextValue {
  const ctx = useContext(VariantContext);
  if (!ctx) throw new Error('useVariant must be used within VariantProvider');
  return ctx;
}

export function VariantProvider({ children }: { children: ReactNode }) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualOverride, setManualOverride] = useState(false);
  const [manualVariant, setManualVariant] = useState<Variant>(defaultManualVariant);
  const [searchModelFilter, setSearchModelFilter] = useState<ModelTab | undefined>(undefined);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setVariants([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await searchVariants(searchQuery, searchModelFilter);
        setVariants(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchModelFilter]);

  const selectVariant = useCallback((variant: Variant) => {
    setSelectedVariant(variant);
    setSearchQuery(variant.rsid);
    setIsDropdownOpen(false);
    setManualOverride(false);
  }, []);

  const handleManualChange = useCallback((field: keyof Variant, value: unknown) => {
    setManualVariant((prev) => {
      const updated = { ...prev, [field]: value } as Variant;
      if (field === 'cpic' || field === 'pgkb') {
        updated.hasDrug = updated.cpic || updated.pgkb;
      }
      return updated;
    });
  }, []);

  const resetSelection = useCallback(() => {
    setSelectedVariant(null);
    setSearchQuery('');
    setManualOverride(false);
  }, []);

  const value = useMemo(
    () => ({
      variants,
      selectedVariant,
      searchQuery,
      setSearchQuery,
      isDropdownOpen,
      setIsDropdownOpen,
      loading,
      error,
      manualOverride,
      setManualOverride,
      manualVariant,
      searchModelFilter,
      setSearchModelFilter,
      selectVariant,
      handleManualChange,
      resetSelection,
    }),
    [
      variants,
      selectedVariant,
      searchQuery,
      isDropdownOpen,
      loading,
      error,
      manualOverride,
      manualVariant,
      searchModelFilter,
      selectVariant,
      handleManualChange,
      resetSelection,
    ],
  );

  return <VariantContext.Provider value={value}>{children}</VariantContext.Provider>;
}
