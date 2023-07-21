import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// components
import { useLocales } from 'src/locales';
import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  ledger: icon('ic_ledger'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useLocales();

  const data = useMemo(
    () => [
      // OVERVIEW
      // ----------------------------------------------------------------------
      {
        subheader: 'overview',
        items: [{ title: 'Dashboard', path: paths.dashboard.root, icon: ICONS.dashboard }],
      },

      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        subheader: 'management',
        items: [
          // CATEGORY
          // {
          //   title: t('category'),
          //   path: paths.dashboard.category.root,
          //   icon: ICONS.blog,
          //   children: [
          //     { title: t('list'), path: paths.dashboard.category.root },
          //     { title: t('create'), path: paths.dashboard.category.new },
          //   ],
          // },

          // BRAND
          // {
          //   title: t('brands'),
          //   path: paths.dashboard.brand.root,
          //   icon: ICONS.job,
          //   children: [
          //     { title: t('list'), path: paths.dashboard.brand.root },
          //     { title: t('create'), path: paths.dashboard.brand.new },
          //   ],
          // },

          // USER

          {
            title: t('user'),
            path: paths.dashboard.user.root,
            icon: ICONS.user,
            children: [
              { title: t('list'), path: paths.dashboard.user.root },
              { title: t('create'), path: paths.dashboard.user.new },
            ],
          },

          // LEDGERS

          {
            title: t('Parties'),
            path: paths.dashboard.ledger.root,
            icon: ICONS.ledger,
            children: [
              { title: t('list'), path: paths.dashboard.ledger.root },
              // { title: t('create'), path: paths.dashboard.product.new },
            ],
          },

          // PRODUCT

          {
            title: t('product'),
            path: paths.dashboard.product.root,
            icon: ICONS.product,
            children: [
              { title: t('list'), path: paths.dashboard.product.root },
              // { title: t('create'), path: paths.dashboard.product.new },
            ],
          },
          {
            title: t('Vouchers'),
            path: paths.dashboard.voucher.root,
            icon: ICONS.invoice,
            children: [
              { title: t('list'), path: paths.dashboard.voucher.root },
              // { title: t('create'), path: paths.dashboard.voucher.new },
            ],
          },
        ],
      },
    ],
    [t]
  );

  return data;
}
