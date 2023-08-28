import { Controller, useFormContext } from 'react-hook-form';
// @mui
import Autocomplete from '@mui/material/Autocomplete';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// components
import { useGetLedgers } from 'src/api/ledger';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function VoucherNewEditStatusDate() {
  const { control, watch } = useFormContext();

  const { ledgers, ledgersLoading, ledgersEmpty, refreshLedgers } = useGetLedgers();

  const values = watch();
  return (
    <Stack
      spacing={2}
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ p: 3, bgcolor: 'background.neutral' }}
    >
      <RHFTextField
        disabled
        name="voucherNumber"
        label="Voucher number"
        value={values.voucherNumber}
      />

      <RHFSelect
        fullWidth
        name="party_name"
        label="Party A/c Name"
        InputLabelProps={{ shrink: true }}
        PaperPropsSx={{ textTransform: 'capitalize' }}
      >
        {ledgers.map((option) => (
          <MenuItem key={option.name} value={option.guid}>
            {option.name}
          </MenuItem>
        ))}
      </RHFSelect>

      {/* <Autocomplete
        // name={`items[${index}].productName`}
        label="Party A/c Name"
        fullWidth
        name={values.party_name}
        options={ledgers ? ledgers.map((option) => option.name) : []}
        // getOptionLabel={(option) => option}
        renderInput={(params) => <TextField {...params} label="Party A/c Name" />}
        // renderOption={(props, option) => {
        //   const { name, id, guid } = ledgers.filter((ledger) => ledger.name === option)[0];

        //   if (!name) {
        //     return null;
        //   }

        //   return (
        //     <li {...props} key={id}>
        //       {name}
        //     </li>
        //   );
        // }}
      /> */}

      <RHFSelect
        fullWidth
        name="status"
        label="Status"
        disabled
        InputLabelProps={{ shrink: true }}
        PaperPropsSx={{ textTransform: 'capitalize' }}
      >
        {[
          { value: 1, name: 'synced' },
          { value: 0, name: 'pending' },
          { value: 2, name: 'cancelled' },
        ].map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.name}
          </MenuItem>
        ))}
      </RHFSelect>

      <Controller
        name="createdAt"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <DatePicker
            label="Date create"
            value={new Date(field.value)}
            onChange={(newValue) => {
              field.onChange(newValue);
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!error,
                helperText: error?.message,
              },
            }}
          />
        )}
      />
    </Stack>
  );
}
