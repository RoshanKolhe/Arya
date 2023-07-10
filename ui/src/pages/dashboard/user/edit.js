import { Helmet } from 'react-helmet-async';
import { ProductEditView } from 'src/sections/product/view';
import { UserEditView } from 'src/sections/user/view';
// sections

// ----------------------------------------------------------------------

export default function UserEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: User Edit</title>
      </Helmet>

      <UserEditView />
    </>
  );
}
