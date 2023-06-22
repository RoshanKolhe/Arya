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
  },
};
