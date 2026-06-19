import type { InferenceMeta } from '@/types/ml.types';

export default function InferenceMetaFooter({ meta }: { meta: InferenceMeta }) {
  if (!meta.preprocessVersion && !meta.modelVersion && meta.inCatalog === undefined) {
    return null;
  }

  return (
    <p className="font-mono text-[8px] text-[var(--muted2)] tracking-[0.06em] pt-2 border-t border-[var(--border)] mt-4">
      {meta.inCatalog === false ? 'Custom input · ' : 'Catalog inference · '}
      {meta.preprocessVersion ? `preprocess ${meta.preprocessVersion}` : null}
      {meta.preprocessVersion && meta.modelVersion ? ' · ' : null}
      {meta.modelVersion ? `model ${meta.modelVersion}` : null}
    </p>
  );
}
