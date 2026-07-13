import { useEffect, useMemo, useState } from 'react';

import { filterCatalog, loadCatalog, type CatalogData } from '@/lib/catalog';
import type { CategoryId } from '@/lib/types';

type UseCatalogResult = CatalogData & {
  loading: boolean;
  refresh: () => void;
};

export function useCatalog(): UseCatalogResult {
  const [catalog, setCatalog] = useState<CatalogData>({
    vendors: [],
    services: [],
    source: 'local',
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      const next = await loadCatalog();
      if (!alive) return;
      setCatalog(next);
      setLoading(false);
    }

    run();
    return () => {
      alive = false;
    };
  }, [refreshKey]);

  return {
    ...catalog,
    loading,
    refresh: () => setRefreshKey((key) => key + 1),
  };
}

export function useFilteredCatalog(
  catalog: Pick<CatalogData, 'vendors' | 'services'>,
  query: string,
  categoryId: CategoryId | 'all'
) {
  return useMemo(() => filterCatalog(catalog, query, categoryId), [catalog, query, categoryId]);
}
