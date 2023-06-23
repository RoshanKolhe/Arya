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

// ----------------------------------------------------------------------

export default function CategoryNewEditForm({ currentCategory }) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const NewCategorySchema = Yup.object().shape({
    categoryName: Yup.string().required('Category Name is required'),
  });

  const defaultValues = useMemo(
    () => ({
      categoryName: currentCategory?.categoryName || '',
    }),
    [currentCategory]
  );

  const methods = useForm({
    resolver: yupResolver(NewCategorySchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentCategory) {
      reset(defaultValues);
    }
  }, [currentCategory, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentCategory) {
        const inputData = {
          categoryName: data.categoryName,
        };
        await axiosInstance
          .patch(`/api/categories/${currentCategory.id}`, inputData)
          .then((res) => {
            reset();
            enqueueSnackbar('Update success!');
            router.push(paths.dashboard.category.root);
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
          categoryName: data.categoryName,
        };
        await axiosInstance
          .post(`/api/category/create`, inputData)
          .then((res) => {
            reset();
            enqueueSnackbar('Create success!');
            router.push(paths.dashboard.category.root);
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
            Title...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField name="categoryName" label="Category Name" />
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
          {!currentCategory ? 'Create Category' : 'Save Changes'}
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

CategoryNewEditForm.propTypes = {
  currentCategory: PropTypes.object,
};
