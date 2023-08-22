// @mui
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
// _mock
// components
// assets
import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify/iconify';
import { useSettingsContext } from 'src/components/settings';
import VoucherListView from 'src/sections/voucher/view/voucher-list-view';
//
import { useSnackbar } from 'notistack';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { SeoIllustration } from '../../../../assets/illustrations';
import AppWelcome from '../app-welcome';
// ----------------------------------------------------------------------

export default function OverviewAppView() {
  const { user } = useAuthContext();

  const theme = useTheme();

  const settings = useSettingsContext();

  const { enqueueSnackbar } = useSnackbar();

  const handleSyncAll = () => {
    // Logic for syncing ledgers
    axiosInstance
      .post(endpoints.ledger.sync)
      .then((ledgerRes) => {
        const ledgerData = ledgerRes.data;
        enqueueSnackbar(ledgerData?.message || 'Ledger sync successful');

        // Logic for syncing products after ledger sync
        axiosInstance
          .post(endpoints.product.sync)
          .then((productRes) => {
            const productData = productRes.data;
            enqueueSnackbar(productData?.message || 'Product sync successful');
          })
          .catch((productErr) => {
            console.log(productErr);
            enqueueSnackbar(productErr?.error?.message || 'Error syncing products', {
              variant: 'error',
            });
          });
      })
      .catch((ledgerErr) => {
        console.log(ledgerErr);
        enqueueSnackbar(ledgerErr?.error?.message || 'Error syncing ledgers', { variant: 'error' });
      });
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <AppWelcome
            title={`Welcome back 👋 \n ${user?.displayName}`}
            description="To sync all products and ledgers from tally click on below sync button and make sure that tally is runnig "
            img={<SeoIllustration />}
            action={
              <Button
                variant="contained"
                color="primary"
                onClick={handleSyncAll}
                startIcon={<Iconify icon="ci:arrows-reload-01" />}
              >
                Sync All
              </Button>
            }
          />
        </Grid>

        <Grid xs={12} md={12}>
          <VoucherListView />
        </Grid>

        {/* <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Total Active Users"
            percent={2.6}
            total={18765}
            chart={{
              series: [5, 18, 12, 51, 68, 11, 39, 37, 27, 20],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Total Installed"
            percent={0.2}
            total={4876}
            chart={{
              colors: [theme.palette.info.light, theme.palette.info.main],
              series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Total Downloads"
            percent={-0.1}
            total={678}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppCurrentDownload
            title="Current Download"
            chart={{
              series: [
                { label: 'Mac', value: 12244 },
                { label: 'Window', value: 53345 },
                { label: 'iOS', value: 44313 },
                { label: 'Android', value: 78343 },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppAreaInstalled
            title="Area Installed"
            subheader="(+43%) than last year"
            chart={{
              categories: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ],
              series: [
                {
                  year: '2019',
                  data: [
                    {
                      name: 'Asia',
                      data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                    },
                    {
                      name: 'America',
                      data: [10, 34, 13, 56, 77, 88, 99, 77, 45, 13, 56, 77],
                    },
                  ],
                },
                {
                  year: '2020',
                  data: [
                    {
                      name: 'Asia',
                      data: [51, 35, 41, 10, 91, 69, 62, 148, 91, 69, 62, 49],
                    },
                    {
                      name: 'America',
                      data: [56, 13, 34, 10, 77, 99, 88, 45, 77, 99, 88, 77],
                    },
                  ],
                },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} lg={8}>
          <AppNewInvoice
            title="New Invoice"
            tableData={_appInvoices}
            tableLabels={[
              { id: 'id', label: 'Invoice ID' },
              { id: 'category', label: 'Category' },
              { id: 'price', label: 'Price' },
              { id: 'status', label: 'Status' },
              { id: '' },
            ]}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppTopRelated title="Top Related Applications" list={_appRelated} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppTopInstalledCountries title="Top Installed Countries" list={_appInstalled} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppTopAuthors title="Top Authors" list={_appAuthors} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <Stack spacing={3}>
            <AppWidget
              title="Conversion"
              total={38566}
              icon="solar:user-rounded-bold"
              chart={{
                series: 48,
              }}
            />

            <AppWidget
              title="Applications"
              total={55566}
              icon="fluent:mail-24-filled"
              color="info"
              chart={{
                series: 75,
              }}
            />
          </Stack>
        </Grid> */}
      </Grid>
    </Container>
  );
}
