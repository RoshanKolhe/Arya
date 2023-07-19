import { Helmet } from 'react-helmet-async';
import VoucherDetailsView from 'src/sections/voucher/view/voucher-details-view';
// sections

// ----------------------------------------------------------------------

export default function VoucherEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Order Details</title>
      </Helmet>

      <VoucherDetailsView />
    </>
  );
}
