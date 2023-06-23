// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetBrands() {
  const URL = endpoints.brand.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshBrands = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    brands: data || [],
    brandsLoading: isLoading,
    brandsError: error,
    brandsValidating: isValidating,
    brandsEmpty: !isLoading && !data?.length,
    refreshBrands, // Include the refresh function separately
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

