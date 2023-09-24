/* eslint-disable no-restricted-globals */
import { useCallback, useEffect, useState } from 'react';
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
  const [subTotal, setSubTotal] = useState(0);
  const { control, setValue, watch, resetField } = useFormContext();

  const { products, productsLoading, productsEmpty } = useGetProducts();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // console.log(fields);

  const values = watch();
  console.log('🚀🚀🚀🚀🚀 ~ values:', values);

  // Calculate the total discount
  // const totalDiscount = values.items.reduce((acc, item) => {
  //   const discount = Number(item.discount);
  //   return !isNaN(discount) ? acc + discount : acc;
  // }, 0);

  // Calculate the total and subtotal
  const { _CGSTAmount, _SGSTOrUTGSTAmount, total, _subTotal, _discountAmount } =
    values.items.reduce(
      (acc, item) => {
        const MRP = Number(item.rate);
        const RM = Number(item.retailerMargin);
        const TAX = item.cess
          ? Number(item.cgst) + Number(item.sgstOrUtgst) + Number(item.cess)
          : Number(item.cgst) + Number(item.sgstOrUtgst);
        const RATE = (MRP / (1 + RM / 100) / (1 + TAX / 100)).toFixed(2);
        const newTotal = Number(item.quantity) * RATE;

        const discountAmount = (Number(item.discount) / 100) * newTotal;
        const discountedTotal = newTotal - discountAmount;

        const CGST = Number(item.cgst);
        const CGSTAmount = (MRP * CGST) / 100;

        const SGSTOrUTGST = Number(item.sgstOrUtgst);
        const SGSTOrUTGSTAmount = (MRP * SGSTOrUTGST) / 100;

        return {
          _CGSTAmount: acc._CGSTAmount + CGSTAmount,
          _SGSTOrUTGSTAmount: acc._SGSTOrUTGSTAmount + SGSTOrUTGSTAmount,
          _discountAmount: acc._discountAmount + discountAmount,
          total: acc.total + discountedTotal,
          _subTotal: acc._subTotal + newTotal,
        };
      },
      { total: 0, _discountAmount: 0, _subTotal: 0, _CGSTAmount: 0, _SGSTOrUTGSTAmount: 0 }
    );
  const sumTotalCGST = _CGSTAmount;
  const sumTotalSGSTOrUTGST = _SGSTOrUTGSTAmount;

  // Update state values
  useEffect(() => {
    setSubTotal(_subTotal);
    // setValue('totalAmount', total.toFixed(2));
    setValue('discount', _discountAmount.toFixed(2));
  }, [values.items, setSubTotal, setValue, total, _subTotal, _discountAmount]);

  const handleAdd = () => {
    append({
      godown: '',
      _godown: '',
      cess: '',
      cgst: '',
      sgstOrUtgst: '',
      retailerMargin: '',
      productGuid: '',
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
      // Rate = MRP / (1 + RM / 100) / (1 + Tax / 100);
      const MRP = Number(item.rate);
      const RM = Number(item.retailerMargin);
      const TAX = item.cess
        ? Number(item.cgst) + Number(item.sgstOrUtgst) + Number(item.cess)
        : Number(item.cgst) + Number(item.sgstOrUtgst);
      // console.log('🚀 ~ TAX:', TAX, ' RM:', RM, ' MRP:', MRP);
      const RATE = (MRP / (1 + RM / 100) / (1 + TAX / 100)).toFixed(2);
      // console.log('🚀 ~ RATE:', RATE);
      const newTotal = Number(item.quantity) * RATE;

      // Calculate the discounted total based on the new discount
      const discountAmount = (item.discount / 100) * newTotal;
      const discountedTotal = newTotal - discountAmount;
      setValue(`items[${index}].total`, discountedTotal.toFixed(2));
    },
    [setValue, values.items]
  );

  const handleChangePrice = useCallback(
    (event, index) => {
      if (event && event.target.value !== '' && event.target.value !== null) {
        const newValue = Number(event.target.value);
        if (!isNaN(newValue)) {
          setValue(`items[${index}].rate`, `${newValue}`);
          const item = values.items[index];
          // Rate = MRP / (1 + RM / 100) / (1 + Tax / 100);
          const MRP = Number(item.rate);
          const RM = Number(item.retailerMargin);
          const TAX = item.cess
            ? Number(item.cgst) + Number(item.sgstOrUtgst) + Number(item.cess)
            : Number(item.cgst) + Number(item.sgstOrUtgst);
          console.log('🚀 ~ TAX:', TAX, ' RM:', RM, ' MRP:', MRP);
          const RATE = (MRP / (1 + RM / 100) / (1 + TAX / 100)).toFixed(2);
          console.log('🚀 ~ RATE:', RATE);
          const newTotal = Number(item.quantity) * RATE;

          // Calculate the discounted total based on the new discount
          const discountAmount = (Number(item.discount) / 100) * newTotal;
          console.log('🚀 ~ discountAmount:', discountAmount);
          const discountedTotal = newTotal - discountAmount;
          setValue(`items[${index}].total`, discountedTotal.toFixed(2));
        }
      } else {
        setValue(`items[${index}].rate`, '69');
      }
    },
    [setValue, values.items]
  );

  const handleChangeDiscount = useCallback(
    (event, index) => {
      const newDiscount = parseFloat(event.target.value) || 0;
      setValue(`items[${index}].discount`, newDiscount);
      const item = values.items[index];

      // Rate = MRP / (1 + RM / 100) / (1 + Tax / 100);
      const MRP = Number(item.rate);
      const RM = Number(item.retailerMargin);
      const TAX = item.cess
        ? Number(item.cgst) + Number(item.sgstOrUtgst) + Number(item.cess)
        : Number(item.cgst) + Number(item.sgstOrUtgst);
      // console.log('🚀 ~ TAX:', TAX, ' RM:', RM, ' MRP:', MRP);
      const RATE = (MRP / (1 + RM / 100) / (1 + TAX / 100)).toFixed(2);
      // console.log('🚀 ~ RATE:', RATE);
      const newTotal = Number(item.quantity) * RATE;

      const discountAmount = (newDiscount / 100) * newTotal;
      const discountedTotal = newTotal - discountAmount;
      setValue(`items[${index}].total`, discountedTotal.toFixed(2));
    },
    [setValue, values.items]
  );

  const handleChangeNote = useCallback(
    (event, index) => {
      setValue(`items[${index}].notes`, event.target.value);
    },
    [setValue]
  );

  const handleProductSelect = (event, index, selectedProductName) => {
    console.log('🚀 ~ event:', event?.target?.textContent);
    console.log('🚀 ~ index:', index);
    // Find the selected product in your products array by its name
    const selectedProductData = products.find(
      (product) => product.name === event?.target?.textContent
    );
    console.log('🚀 ~ selectedProductData:', selectedProductData);
    setValue(`items[${index}].productGuid`, selectedProductData?.guid);
    // setValue(`items[${index}].cess`, selectedProductData?.cess);
    // setValue(`items[${index}].cgst`, selectedProductData?.cgst);
    // setValue(`items[${index}].sgstOrUtgst`, selectedProductData?.sgstOrUtgst);
    // setValue(`items[${index}].retailerMargin`, selectedProductData?.retailerMargin);
    // Update the selectedProduct state with the selected product data
    console.log('🚀 ~ values updated:', values);
  };
  const renderTotal = (
    <Stack
      spacing={2}
      alignItems="flex-end"
      sx={{ mt: 3, textAlign: 'right', typography: 'body2' }}
    >
      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Subtotal</Box>
        <Box sx={{ width: 160, typography: 'subtitle2' }}>{fCurrency(subTotal) || '-'}</Box>
      </Stack>

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

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Discount</Box>
        <Box
          sx={{
            width: 160,
            ...(values.discount && { color: 'error.main' }),
          }}
        >
          {values.discount && values.discount !== 0 ? `- ${fCurrency(values.discount)}` : '-'}
        </Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>CGST</Box>
        <Box sx={{ width: 160 }}>{sumTotalCGST ? fCurrency(sumTotalCGST) : '-'}</Box>
      </Stack>
      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>SGST</Box>
        <Box sx={{ width: 160 }}>{sumTotalSGSTOrUTGST ? fCurrency(sumTotalSGSTOrUTGST) : '-'}</Box>
      </Stack>

      <Stack direction="row" sx={{ typography: 'subtitle1' }}>
        <Box>Total</Box>
        <Box sx={{ width: 160 }}>{fCurrency(values.totalAmount) || '-'}</Box>
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
                  onInputChange={(event) => handleProductSelect(event, index)}
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
