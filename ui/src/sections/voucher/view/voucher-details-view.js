import { useState, useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
// routes
import { paths } from 'src/routes/paths';
// _mock
import { _orders, ORDER_STATUS_OPTIONS } from 'src/_mock';
// components
import { useParams } from 'src/routes/hook';
import { useSettingsContext } from 'src/components/settings';
//
import { useGetVoucher } from 'src/api/voucher';
import VoucherDetailsInfo from '../voucher-details-info';
import VoucherDetailsHistory from '../voucher-details-history';
import VoucherDetailsToolbar from '../voucher-details-toolbar';
import VoucherDetailsItems from '../voucher-details-item';

// ----------------------------------------------------------------------

export default function VoucherDetailsView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { voucher: currentVoucher } = useGetVoucher(id);

  const [voucher, setVoucher] = useState();

  const [status, setStatus] = useState(0);

  const handleChangeStatus = useCallback((newValue) => {
    console.log(newValue);
    setStatus(newValue);
  }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {currentVoucher && (
        <VoucherDetailsToolbar
          backLink={paths.dashboard.voucher.root}
          orderNumber={currentVoucher.id || 0}
          createdAt={currentVoucher.createdAt}
          status={status}
          onChangeStatus={handleChangeStatus}
          statusOptions={ORDER_STATUS_OPTIONS}
        />
      )}

      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Stack spacing={3} direction={{ xs: 'column-reverse', md: 'column' }}>
            {currentVoucher && (
              <VoucherDetailsItems
                items={currentVoucher.products}
                taxes={currentVoucher.taxes || 0}
                shipping={currentVoucher.shipping}
                discount={currentVoucher.discount}
                subTotal={currentVoucher.subTotal}
                totalAmount={currentVoucher.totalAmount}
              />
            )}

            {/* <VoucherDetailsHistory history={currentVoucher.history} /> */}
          </Stack>
        </Grid>

        <Grid xs={12} md={4}>
          {currentVoucher && <VoucherDetailsInfo party_name={currentVoucher.party_name} />}
        </Grid>
      </Grid>
    </Container>
  );
}
