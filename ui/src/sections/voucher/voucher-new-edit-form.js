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
import { RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import axiosInstance from 'src/utils/axios';
import { IconButton, InputAdornment } from '@mui/material';
import Iconify from 'src/components/iconify/iconify';
import { useBoolean } from 'src/hooks/use-boolean';

// ----------------------------------------------------------------------

export default function UserNewEditForm({ currentUser }) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const password = useBoolean();

  const NewUserSchema = Yup.object().shape({
    name: Yup.string().required('User Name is required'),
    email: Yup.string().email('Email must be a valid email address').required('email is required'),
    password: Yup.string()
      .min(8, 'Password is too short - should be 8 chars minimum.')
      .matches(
        // eslint-disable-next-line no-useless-escape
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
        'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character'
      )
      .test('', (value, context) => {
        // Check if the condition is true
        if (!currentUser) {
          // Apply the required validation
          return Yup.string().required('Password is required').isValidSync(value);
        }
        // Skip the required validation
        return true;
      }),
    contactNo: Yup.string('Enter Contact Number')
      .required('Contact Number is required')
      .max(10, 'Must be less than 10 characters'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      contactNo: currentUser?.contactNo || '',
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentUser) {
      reset(defaultValues);
    }
  }, [currentUser, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
    try {
      if (currentUser) {
        const inputData = {
          name: data.name,
          email: data.email,
          contactNo: data.contactNo,
        };
        await axiosInstance
          .patch(`/api/users/${currentUser.id}`, inputData)
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
            <RHFTextField name="name" label="Name" />
            <RHFTextField name="email" label="Email" />
            {!currentUser ? (
              <RHFTextField
                name="password"
                label="Password"
                type={password.value ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={password.onToggle} edge="end">
                        <Iconify
                          icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            ) : null}
            <RHFTextField name="contactNo" label="Contact" />
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
          {!currentUser ? 'Create User' : 'Save Changes'}
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

UserNewEditForm.propTypes = {
  currentUser: PropTypes.object,
};
