// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// api
import { useGetProduct } from 'src/api/product';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useGetVoucher } from 'src/api/voucher';
import VoucherNewEditForm from '../voucher-new-edit-form';
//

// ----------------------------------------------------------------------

export default function VoucherEditView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { voucher: currentVoucher } = useGetVoucher(id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'User',
            href: paths.dashboard.user.root,
          },
          { name: currentVoucher?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <VoucherNewEditForm currentVoucher={currentVoucher} />
    </Container>
  );
}
