import { Helmet } from 'react-helmet-async';
import { UserListView } from 'src/sections/user/view';
import VoucherListView from 'src/sections/voucher/view/voucher-list-view';
// sections

// ----------------------------------------------------------------------

export default function VoucherListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Voucher List</title>
      </Helmet>

      <VoucherListView />
    </>
  );
}
