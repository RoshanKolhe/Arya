import { Helmet } from 'react-helmet-async';
import { CategoryListView } from 'src/sections/category/view';
// sections

// ----------------------------------------------------------------------

export default function CategoryListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Category List</title>
      </Helmet>

      <CategoryListView />
    </>
  );
}
