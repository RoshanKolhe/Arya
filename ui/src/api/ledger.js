// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetLedgers() {
  const URL = endpoints.ledger.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshLedgers = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    ledgers: data || [],
    ledgersLoading: isLoading,
    ledgersError: error,
    ledgersValidating: isValidating,
    ledgersEmpty: !isLoading && !data?.length,
    refreshLedgers, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetBrand(brandId) {
  const URL = brandId ? [endpoints.brand.details(brandId)] : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      brand: data,
      brandLoading: isLoading,
      brandError: error,
      brandValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
