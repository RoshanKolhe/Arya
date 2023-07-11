import { Helmet } from 'react-helmet-async';
// sections
import NewPasswordView from 'src/sections/auth/amplify/new-password-view';

// ----------------------------------------------------------------------

export default function NewPasswordPage() {
  return (
    <>
      <Helmet>
        <title> Amplify: New Password</title>
      </Helmet>

      <NewPasswordView />
    </>
  );
}
