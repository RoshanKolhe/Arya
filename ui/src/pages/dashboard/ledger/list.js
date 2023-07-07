import { Helmet } from 'react-helmet-async';
import { ProductListView } from 'src/sections/product/view';
// sections

// ----------------------------------------------------------------------

export default function ProductListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Ledger List</title>
      </Helmet>

      <ProductListView />
    </>
  );
}
