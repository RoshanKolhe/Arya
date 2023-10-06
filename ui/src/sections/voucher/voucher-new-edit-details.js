/* eslint-disable react/prop-types */
/* eslint-disable no-restricted-globals */
import sum from 'lodash/sum';
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

export default function VoucherNewEditDetails({ defaultValues }) {
  const { control, setValue, watch, resetField } = useFormContext();
  const [totalAmount, setTotalAmount] = useState(defaultValues.totalAmount);
  const [totalCgst, setTotalCgst] = useState(0);
  const [totalSgst, setTotalSgst] = useState(0);
  const [totalRoundValue, setTotalRoundValue] = useState(0);
  const [totalCess, setTotalCess] = useState(0);
  const { products, productsLoading, productsEmpty } = useGetProducts();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const values = watch();

  // const totalOnRow = values.items.map((item) => item.quantity * item.rate);

  // const subTotal = sum(totalOnRow);

  // const totalAmount = values.items.reduce((acc, item) => acc + item.total, 0);

  useEffect(() => {
    let calTotal = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let cessAmount = 0;

    values.items.forEach((item) => {
      const total = parseFloat(item.total);
      const cgstRate = parseFloat(item?.productName?.cgst || 0);
      const sgstRate = parseFloat(item?.productName?.sgstOrUtgst || 0);
      const cessRate = parseFloat(item?.productName?.cess || 0);

      calTotal += total;
      cgstAmount += (total * cgstRate) / 100;
      sgstAmount += (total * sgstRate) / 100;
      cessAmount += (total * cessRate) / 100;
    });
    setTotalCgst(cgstAmount.toFixed(2));
    setTotalSgst(sgstAmount.toFixed(2));
    setTotalCess(cessAmount.toFixed(2));
    const totalTax = (cgstAmount + sgstAmount + cessAmount).toFixed(2);
    const totalValue = calTotal + parseFloat(totalTax);
    console.log(totalValue);
    const roundedValue = Math.round(totalValue);
    const difference = totalValue - roundedValue;
    console.log(
      roundedValue,
      Math.floor(totalValue * 100) / 100
    );
    // Determine whether to display a "+" or "-" sign
    const sign = totalValue >= roundedValue ? '-' : '+';

    // Set the roundedValue including the sign
    setTotalRoundValue(`${sign}${Math.abs(difference.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0])}`);
    setTotalAmount(roundedValue);
  }, [values]);

  console.log(totalRoundValue);

  const handleAdd = () => {
    append({
      productName: null,
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
      const totalTax =
        (Number(item.productName.cgst) +
          Number(item.productName.sgstOrUtgst) +
          Number(item.productName.cess)) /
        100;

      const totalRetailerMargin = Number(item.productName.retailerMargin) / 100;

      const productTotal =
        (Number(item.rate) * Number(item.quantity)) / (1 + totalRetailerMargin) / (1 + totalTax);

      const discountedTotal = (productTotal - productTotal * (item.discount / 100)).toFixed(2);
      // const cgst = totalCgst + (discountedTotal * Number(item.productName.cgst)) / 100;
      // const sgst = totalSgst + (discountedTotal * Number(item.productName.sgstOrUtgst)) / 100;
      // const cess = totalCess + (discountedTotal * Number(item.productName.cess)) / 100;

      // setTotalCgst(cgst.toFixed(2));
      // setTotalSgst(sgst.toFixed(2));
      // setTotalCess(cess.toFixed(2));
      setValue(`items[${index}].total`, discountedTotal);
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
          console.log(item);
          const totalTax =
            (Number(item.productName.cgst) +
              Number(item.productName.sgstOrUtgst) +
              Number(item.productName.cess)) /
            100;

          const totalRetailerMargin = Number(item.productName.retailerMargin) / 100;

          const productTotal =
            (Number(item.rate) * Number(item.quantity)) /
            (1 + totalRetailerMargin) /
            (1 + totalTax);

          const discountedTotal = (productTotal - productTotal * (item.discount / 100)).toFixed(2);
          // const cgst = totalCgst + (discountedTotal * Number(item.productName.cgst)) / 100;
          // const sgst = totalSgst + (discountedTotal * Number(item.productName.sgstOrUtgst)) / 100;
          // const cess = totalCess + (discountedTotal * Number(item.productName.cess)) / 100;

          // setTotalCgst(cgst.toFixed(2));
          // setTotalSgst(sgst.toFixed(2));
          // setTotalCess(cess.toFixed(2));

          setValue(`items[${index}].total`, discountedTotal);
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

      const totalTax =
        (Number(item.productName.cgst) +
          Number(item.productName.sgstOrUtgst) +
          Number(item.productName.cess)) /
        100;

      const totalRetailerMargin = Number(item.productName.retailerMargin) / 100;

      const productTotal =
        (Number(item.rate) * Number(item.quantity)) / (1 + totalRetailerMargin) / (1 + totalTax);

      const discountedTotal = (productTotal - productTotal * (item.discount / 100)).toFixed(2);
      // const cgst = totalCgst + (discountedTotal * Number(item.productName.cgst)) / 100;
      // const sgst = totalSgst + (discountedTotal * Number(item.productName.sgstOrUtgst)) / 100;
      // const cess = totalCess + (discountedTotal * Number(item.productName.cess)) / 100;

      // setTotalCgst(cgst.toFixed(2));
      // setTotalSgst(sgst.toFixed(2));
      // setTotalCess(cess.toFixed(2));
      setValue(`items[${index}].total`, discountedTotal);
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
      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>CGST</Box>
        <Box sx={{ width: 160 }}>{totalCgst || '-'}</Box>
      </Stack>
      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>SGST</Box>
        <Box sx={{ width: 160 }}>{totalSgst || '-'}</Box>
      </Stack>
      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>CESS</Box>
        <Box sx={{ width: 160 }}>{totalCess || '-'}</Box>
      </Stack>
      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Round Off</Box>
        <Box sx={{ width: 160 }}>{totalRoundValue || '-'}</Box>
      </Stack>
      <Stack direction="row" sx={{ typography: 'subtitle1' }}>
        <Box>Total</Box>
        <Box sx={{ width: 160 }}>{totalAmount || '-'}</Box>
      </Stack>
    </Stack>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ color: 'text.disabled', mb: 3 }}>
        Details:
      </Typography>

      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        {values.items.map((item, index) => {
          const selectedItem = item?.productName
            ? products.find((product) => product.guid === item.productName.guid)
            : null;

          const batchArray = selectedItem ? selectedItem.batchName.split(',') : ['0'];

          return (
            <Stack key={item.id} alignItems="flex-end" spacing={1.5}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: 1 }}>
                <RHFAutocomplete
                  name={`items[${index}].productName`}
                  label="Name"
                  size="small"
                  fullWidth
                  options={products}
                  // onBlur={(event) => {
                  //   console.log('inside blurr', event);
                  // }}
                  getOptionLabel={(option) => `${option.name}`}
                  renderOption={(props, option) => {
                    const { name, id } = products.filter((pin) => pin.guid === option.guid)[0];

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
                  onBlur={(event) => handleChangePrice(event, index)}
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
