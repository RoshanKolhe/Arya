import { Helmet } from 'react-helmet-async';
import { BrandCreateView } from 'src/sections/brand/view';

// ----------------------------------------------------------------------

export default function BrandCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new Brand</title>
      </Helmet>

      <BrandCreateView />
    </>
  );
}
