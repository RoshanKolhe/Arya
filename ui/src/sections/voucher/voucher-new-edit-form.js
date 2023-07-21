import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// _mock
import { _addressBooks } from 'src/_mock';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import FormProvider from 'src/components/hook-form';
//
import VoucherNewEditDetails from './voucher-new-edit-details';
import VoucherNewEditStatusDate from './voucher-new-edit-status-date';

// ----------------------------------------------------------------------

export default function VoucherNewEditForm({ currentVoucher }) {
  const router = useRouter();

  const loadingSave = useBoolean();

  const loadingSend = useBoolean();

  const NewInvoiceSchema = Yup.object().shape({
    createdAt: Yup.mixed().nullable().required('Create date is required'),
    // not required
    taxes: Yup.number(),
    status: Yup.number(),
    discount: Yup.number(),
    shipping: Yup.number(),
    totalAmount: Yup.number(),
    voucherNumber: Yup.string(),
  });
  const defaultValues = useMemo(
    () => ({
      party_name: currentVoucher?.guid || '',
      voucherNumber: currentVoucher?.id || 'INV-1990',
      createdAt: currentVoucher?.createdAt || new Date(),
      taxes: currentVoucher?.taxes || 0,
      shipping: currentVoucher?.shipping || 0,
      status: currentVoucher?.is_synced || 0,
      discount: currentVoucher?.discount || 0,
      items: currentVoucher?.products || [
        {
          productName: '',
          notes: '',
          description: '',
          service: '',
          quantity: 1,
          rate: 0,
          total: 0,
        },
      ],
      totalAmount: currentVoucher?.totalAmount || 0,
    }),
    [currentVoucher]
  );

  const methods = useForm({
    resolver: yupResolver(NewInvoiceSchema),
    defaultValues,
  });

  const {
    reset,

    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  const handleCreateAndSend = handleSubmit(async (data) => {
    loadingSend.onTrue();
    console.log(data);

    // try {
    //   await new Promise((resolve) => setTimeout(resolve, 500));
    //   reset();
    //   loadingSend.onFalse();
    //   router.push(paths.dashboard.invoice.root);
    //   console.info('DATA', JSON.stringify(data, null, 2));
    // } catch (error) {
    //   console.error(error);
    //   loadingSend.onFalse();
    // }
  });

  useEffect(() => {
    if (currentVoucher) {
      const {
        id,
        createdAt,
        _party_name,
        taxes,
        shipping,
        status,
        is_synced,
        discount,
        products,
        totalAmount,
      } = currentVoucher;
      const updatedValues = {
        party_name: _party_name,
        voucherNumber: id || 'INV-1990',
        createdAt: createdAt || new Date(),
        taxes: taxes || 0,
        shipping: shipping || 0,
        status: is_synced || 0,
        discount: discount || 0,
        items: products || [{ name: '', notes: '', quantity: 1, rate: 0, total: 0 }],
        totalAmount: totalAmount || 0,
      };
      // Set the form values using the setValue method from react-hook-form
      Object.keys(updatedValues).forEach((key) => {
        methods.setValue(key, updatedValues[key]);
      });
    }
  }, [currentVoucher, methods]);

  return (
    <FormProvider methods={methods}>
      <Card>
        <VoucherNewEditStatusDate />

        <VoucherNewEditDetails />
      </Card>

      <Stack justifyContent="flex-end" direction="row" spacing={2} sx={{ mt: 3 }}>
        <LoadingButton
          size="large"
          variant="contained"
          loading={loadingSend.value && isSubmitting}
          onClick={() => {
            console.log('here');
            handleCreateAndSend();
          }}
        >
          Update
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}

VoucherNewEditForm.propTypes = {
  currentVoucher: PropTypes.object,
};
