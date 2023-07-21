import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
// components
import { RHFAutocomplete, RHFSelect, RHFTextField } from 'src/components/hook-form';
import { useGetLedgers } from 'src/api/ledger';

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
        disabled
        InputLabelProps={{ shrink: true }}
        PaperPropsSx={{ textTransform: 'capitalize' }}
      >
        {ledgers.map((option) => (
          <MenuItem key={option.name} value={option.guid}>
            {option.name}
          </MenuItem>
        ))}
      </RHFSelect>

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
