// @mui
import Container from '@mui/material/Container';
// routes
import { useParams } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
// api
// components
import { useGetVoucher } from 'src/api/voucher';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
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
            name: 'Voucher',
            href: paths.dashboard.voucher.root,
          },
          { name: currentVoucher?.party_name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentVoucher ? <VoucherNewEditForm currentVoucher={currentVoucher} /> : null}
    </Container>
  );
}
