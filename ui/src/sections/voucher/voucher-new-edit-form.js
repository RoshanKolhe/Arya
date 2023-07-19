import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// _mock
import { _tags } from 'src/_mock';
// components
import { useSnackbar } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hook';
import { RHFTextField, RHFSelect } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import axiosInstance from 'src/utils/axios';
import { IconButton, InputAdornment } from '@mui/material';
import Iconify from 'src/components/iconify/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useGetProducts } from 'src/api/product';
import { useGetLedgers } from 'src/api/ledger';

// ----------------------------------------------------------------------

export default function VoucherNewEditForm({ currentVoucher }) {
  console.log(currentVoucher);
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const password = useBoolean();

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filteredLedgers, setFilteredLedgers] = useState([]);

  const { products, productsLoading, productsEmpty } = useGetProducts();
  const { ledgers, ledgersLoading, ledgersEmpty, refreshLedgers } = useGetLedgers();

  const NewVoucherSchema = Yup.object().shape({
    name: Yup.string().required('Party name is required'),
    products: Yup.array().of(
      Yup.object().shape({
        productName: Yup.string().required('Please select the product'),
        quantity: Yup.string().required('Quantity is required'),
        rate: Yup.string().required('Rate is required'),
      })
    ),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentVoucher?._party_name || '',
    }),
    [currentVoucher]
  );

  const methods = useForm({
    resolver: yupResolver(NewVoucherSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentVoucher) {
      reset(defaultValues);
    }
  }, [currentVoucher, defaultValues, reset]);
  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
    try {
      if (currentVoucher) {
        const inputData = {
          name: data.name,
          email: data.email,
          contactNo: data.contactNo,
        };
        await axiosInstance
          .patch(`/api/users/${currentVoucher.id}`, inputData)
          .then((res) => {
            reset();
            enqueueSnackbar('Update success!');
            router.push(paths.dashboard.user.root);
          })
          .catch((err) => {
            enqueueSnackbar(
              err.response.data.error.message
                ? err.response.data.error.message
                : 'something went wrong!',
              { variant: 'error' }
            );
          });
      } else {
        const inputData = {
          name: data.name,
          email: data.email,
          password: data.password,
          contactNo: data.contactNo,
          isActive: true,
          permissions: ['sales'],
        };
        await axiosInstance
          .post(`/register`, inputData)
          .then((res) => {
            reset();
            enqueueSnackbar('Create success!');
            router.push(paths.dashboard.user.root);
          })
          .catch((err) => {
            console.error(err.response.data.error.message);
            enqueueSnackbar(
              err.response.data.error.message
                ? err.response.data.error.message
                : 'something went wrong!',
              { variant: 'error' }
            );
          });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error, { variant: 'error' });
    }
  });

  useEffect(() => {
    if (products.length) {
      setFilteredProducts(products);
    }
    if (ledgers.length) {
      setFilteredLedgers(ledgers);
    }
  }, [products, ledgers]);

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Name,Email,Contact No...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFSelect native name="name" label="Party Name" InputLabelProps={{ shrink: true }}>
              {filteredLedgers.map((ledger) => (
                <option key={ledger.id} value={ledger.guid}>
                  {ledger.name}
                </option>
              ))}
            </RHFSelect>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8} sx={{ display: 'flex', justifyContent: 'end' }}>
        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
          {!currentVoucher ? 'Create User' : 'Save Changes'}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}
        {renderActions}
      </Grid>
    </FormProvider>
  );
}

VoucherNewEditForm.propTypes = {
  currentVoucher: PropTypes.object,
};
