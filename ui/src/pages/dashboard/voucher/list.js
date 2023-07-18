import { Helmet } from 'react-helmet-async';
import LedgerListView from 'src/sections/ledger/view/ledger-list-view';
import { ProductListView } from 'src/sections/product/view';
import { UserListView } from 'src/sections/user/view';
// sections

// ----------------------------------------------------------------------

export default function VoucherListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Voucher List</title>
      </Helmet>

      <UserListView />
    </>
  );
}
