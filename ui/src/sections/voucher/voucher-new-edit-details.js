/* eslint-disable no-restricted-globals */
import sum from 'lodash/sum';
import { useCallback, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import { inputBaseClasses } from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// utils
import { fCurrency } from 'src/utils/format-number';
// _mock

// components
import { TextField } from '@mui/material';
import { useGetProducts } from 'src/api/product';
import { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function VoucherNewEditDetails() {
  const { control, setValue, watch, resetField } = useFormContext();

  const { products, productsLoading, productsEmpty } = useGetProducts();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // console.log(fields);

  const values = watch();

  const totalOnRow = values.items.map((item) => item.quantity * item.rate);

  const subTotal = sum(totalOnRow);

  const totalAmount = values.items.reduce((acc, item) => acc + item.total, 0);

  useEffect(() => {
    setValue('totalAmount', totalAmount);
  }, [setValue, totalAmount]);

  const handleAdd = () => {
    append({
      productName: '',
      notes: '',
      quantity: 1,
      rate: '0',
      discount: 0,
      total: 0,
    });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  const handleChangeQuantity = useCallback(
    (event, index) => {
      setValue(`items[${index}].quantity`, event.target.value);
      const item = values.items[index];
      const newTotal = item.quantity * item.rate;

      // Calculate the discounted total based on the new discount
      const discountAmount = (item.discount / 100) * newTotal;
      const discountedTotal = newTotal - discountAmount;
      setValue(`items[${index}].total`, parseInt(discountedTotal.toFixed(2), 10));
    },
    [setValue, values.items]
  );

  const handleChangePrice = useCallback(
    (event, index) => {
      if (!event || event.target.value === '' || event.target.value === null) {
        setValue(`items[${index}].rate`, '0');
      } else {
        const newValue = Number(event.target.value);
        if (!isNaN(newValue)) {
          setValue(`items[${index}].rate`, `${newValue}`);
          const item = values.items[index];
          const newTotal = item.quantity * item.rate;

          // Calculate the discounted total based on the new discount
          const discountAmount = (item.discount / 100) * newTotal;
          const discountedTotal = newTotal - discountAmount;
          setValue(`items[${index}].total`, parseInt(discountedTotal.toFixed(2), 10));
        }
      }
    },
    [setValue, values.items]
  );

  const handleChangeDiscount = useCallback(
    (event, index) => {
      const newDiscount = parseFloat(event.target.value) || 0;
      setValue(`items[${index}].discount`, newDiscount);
      const item = values.items[index];

      const newTotal = item.quantity * item.rate;

      const discountAmount = (newDiscount / 100) * newTotal;
      const discountedTotal = newTotal - discountAmount;
      setValue(`items[${index}].total`, parseInt(discountedTotal.toFixed(2), 10));
    },
    [setValue, values.items]
  );

  const handleChangeNote = useCallback(
    (event, index) => {
      setValue(`items[${index}].notes`, event.target.value);
    },
    [setValue]
  );

  const renderTotal = (
    <Stack
      spacing={2}
      alignItems="flex-end"
      sx={{ mt: 3, textAlign: 'right', typography: 'body2' }}
    >
      {/* <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Subtotal</Box>
        <Box sx={{ width: 160, typography: 'subtitle2' }}>{fCurrency(subTotal) || '-'}</Box>
      </Stack> */}

      {/* <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Shipping</Box>
        <Box
          sx={{
            width: 160,
            ...(values.shipping && { color: 'error.main' }),
          }}
        >
          {values.shipping ? `- ${fCurrency(values.shipping)}` : '-'}
        </Box>
      </Stack> */}

      {/* <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Discount</Box>
        <Box
          sx={{
            width: 160,
            ...(values.discount && { color: 'error.main' }),
          }}
        >
          {values.discount ? `- ${fCurrency(values.discount)}` : '-'}
        </Box>
      </Stack> */}

      {/* <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Taxes</Box>
        <Box sx={{ width: 160 }}>{values.taxes ? fCurrency(values.taxes) : '-'}</Box>
      </Stack> */}

      <Stack direction="row" sx={{ typography: 'subtitle1' }}>
        <Box>Total</Box>
        <Box sx={{ width: 160 }}>{fCurrency(totalAmount) || '-'}</Box>
      </Stack>
    </Stack>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ color: 'text.disabled', mb: 3 }}>
        Details:
      </Typography>

      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        {fields.map((item, index) => {
          const selectedItem = products.find((product) => product.guid === item.productGuid);
          const batchArray = selectedItem ? selectedItem.batchName.split(',') : [];

          return (
            <Stack key={item.id} alignItems="flex-end" spacing={1.5}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: 1 }}>
                <RHFAutocomplete
                  name={`items[${index}].productName`}
                  label="Name"
                  size="small"
                  fullWidth
                  options={products ? products.map((product) => product.name) : []}
                  getOptionLabel={(option) => option}
                  renderOption={(props, option) => {
                    const { name, id, guid } = products.filter(
                      (product) => product.name === option
                    )[0];

                    if (!name) {
                      return null;
                    }

                    return (
                      <li {...props} key={id}>
                        {name}
                      </li>
                    );
                  }}
                />

                <RHFTextField
                  size="small"
                  type="text"
                  name={`items[${index}].notes`}
                  label="Note"
                  placeholder="Note..."
                  onChange={(event) => handleChangeNote(event, index)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ maxWidth: { md: 300 } }}
                />

                <RHFAutocomplete
                  name={`items[${index}].rate`}
                  label="Price"
                  size="small"
                  freeSolo
                  onInputChange={(event) => handleChangePrice(event, index)}
                  options={batchArray ? batchArray.map((batch) => batch) : []}
                  getOptionLabel={(option) => `${option}`}
                  sx={{ maxWidth: { md: 96 } }}
                  renderInput={(params) => <TextField {...params} label="Price" />}
                />

                {/* <RHFTextField
                  size="small"
                  type="number"
                  name={`items[${index}].rate`}
                  label="Price"
                  placeholder="0.00"
                  onChange={(event) => handleChangePrice(event, index)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box sx={{ typography: 'subtitle2', color: 'text.disabled' }}>₹</Box>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ maxWidth: { md: 96 } }}
                /> */}

                <RHFTextField
                  size="small"
                  type="number"
                  name={`items[${index}].quantity`}
                  label="Pcs"
                  placeholder="0"
                  onChange={(event) => handleChangeQuantity(event, index)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ maxWidth: { md: 96 } }}
                />

                <RHFTextField
                  size="small"
                  type="number"
                  name={`items[${index}].discount`}
                  label="Discount"
                  placeholder="0.00"
                  onChange={(event) => handleChangeDiscount(event, index)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box sx={{ typography: 'subtitle2', color: 'text.disabled' }}>%</Box>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ maxWidth: { md: 96 } }}
                />

                <RHFTextField
                  disabled
                  size="small"
                  type="number"
                  name={`items[${index}].total`}
                  label="Total"
                  placeholder="0.00"
                  value={values.items[index].total === 0 ? '' : values.items[index].total}
                  onChange={(event) => handleChangePrice(event, index)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box sx={{ typography: 'subtitle2', color: 'text.disabled' }}>₹</Box>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    maxWidth: { md: 104 },
                    [`& .${inputBaseClasses.input}`]: {
                      textAlign: { md: 'right' },
                    },
                  }}
                />
              </Stack>

              <Button
                size="small"
                color="error"
                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                onClick={() => handleRemove(index)}
              >
                Remove
              </Button>
            </Stack>
          );
        })}
      </Stack>

      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

      <Stack
        spacing={3}
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-end', md: 'center' }}
      >
        <Button
          size="small"
          color="primary"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleAdd}
          sx={{ flexShrink: 0 }}
        >
          Add Item
        </Button>

        <Stack
          spacing={2}
          justifyContent="flex-end"
          direction={{ xs: 'column', md: 'row' }}
          sx={{ width: 1 }}
        >
          {/* <RHFTextField
            size="small"
            label="Shipping($)"
            name="shipping"
            type="number"
            sx={{ maxWidth: { md: 120 } }}
          /> */}

          {/* <RHFTextField
            size="small"
            label="Discount($)"
            name="discount"
            type="number"
            sx={{ maxWidth: { md: 120 } }}
          /> */}

          {/* <RHFTextField
            size="small"
            label="Taxes(%)"
            name="taxes"
            type="number"
            sx={{ maxWidth: { md: 120 } }}
          /> */}
        </Stack>
      </Stack>

      {renderTotal}
    </Box>
  );
}
