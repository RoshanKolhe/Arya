import { Helmet } from 'react-helmet-async';
import { ProductEditView } from 'src/sections/product/view';
// sections

// ----------------------------------------------------------------------

export default function ProductEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Product Edit</title>
      </Helmet>

      <ProductEditView />
    </>
  );
}
