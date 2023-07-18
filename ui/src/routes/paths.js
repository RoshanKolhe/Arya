// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  // AUTH
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
      newPassword: `${ROOTS.AUTH}/jwt/new-password`,
      forgotPassword: `${ROOTS.AUTH}/jwt/forgot-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    product: {
      root: `${ROOTS.DASHBOARD}/product`,
      new: `${ROOTS.DASHBOARD}/product/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/product/${id}/edit`,
    },
    category: {
      root: `${ROOTS.DASHBOARD}/category`,
      new: `${ROOTS.DASHBOARD}/category/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/category/${id}/edit`,
    },
    brand: {
      root: `${ROOTS.DASHBOARD}/brand`,
      new: `${ROOTS.DASHBOARD}/brand/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/brand/${id}/edit`,
    },
    ledger: {
      root: `${ROOTS.DASHBOARD}/ledger`,
      new: `${ROOTS.DASHBOARD}/brand/ledger`,
      edit: (id) => `${ROOTS.DASHBOARD}/ledger/${id}/edit`,
    },
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
    },
    voucher: {
      root: `${ROOTS.DASHBOARD}/voucher`,
      new: `${ROOTS.DASHBOARD}/voucher/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/voucher/${id}/edit`,
    },
  },
};
