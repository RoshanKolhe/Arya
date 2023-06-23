import { Helmet } from 'react-helmet-async';
import { BrandEditView } from 'src/sections/brand/view';

// ----------------------------------------------------------------------

export default function BrandEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Brand Edit</title>
      </Helmet>

      <BrandEditView />
    </>
  );
}
