import { Helmet } from 'react-helmet-async';
import { ProductCreateView } from 'src/sections/product/view';
import { UserCreateView } from 'src/sections/user/view';
// sections

// ----------------------------------------------------------------------

export default function UserCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new product</title>
      </Helmet>

      <UserCreateView />
    </>
  );
}
