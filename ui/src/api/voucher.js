// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetVouchers() {
  const URL = endpoints.voucher.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshVouchers = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    vouchers: data || [],
    vouchersLoading: isLoading,
    vouchersError: error,
    vouchersValidating: isValidating,
    vouchersEmpty: !isLoading && !data?.length,
    refreshVouchers, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetVoucher(voucherId) {
  const URL = voucherId ? [endpoints.voucher.details(voucherId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      voucher: data,
      voucherLoading: isLoading,
      voucherError: error,
      voucherValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
