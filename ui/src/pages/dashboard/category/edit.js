import { Helmet } from 'react-helmet-async';
import { CategoryEditView } from 'src/sections/category/view';

// ----------------------------------------------------------------------

export default function ProductEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Product Edit</title>
      </Helmet>

      <CategoryEditView />
    </>
  );
}
