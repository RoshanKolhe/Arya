import { Helmet } from 'react-helmet-async';
import { CategoryCreateView } from 'src/sections/category/view';
// sections

// ----------------------------------------------------------------------

export default function CategoryCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new category</title>
      </Helmet>

      <CategoryCreateView />
    </>
  );
}
