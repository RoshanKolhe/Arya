import { useState, useCallback, useEffect } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { usePathname, useRouter } from 'src/routes/hook';
// _mock
import { _orders, ORDER_STATUS_OPTIONS } from 'src/_mock';
// utils
import { fTimestamp } from 'src/utils/format-time';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
  TableSkeleton,
} from 'src/components/table';
//
import { useGetVouchers } from 'src/api/voucher';
import axiosInstance from 'src/utils/axios';
import { useSnackbar } from 'notistack';
import VoucherTableToolbar from '../voucher-table-toolbar';
import VoucherTableFiltersResult from '../voucher-table-filters-result';
import VoucherTableRow from '../voucher-table-row';
// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }];

const TABLE_HEAD = [
  { id: 'id', label: 'Order', width: 116 },
  { id: 'name', label: 'Customer' },
  { id: 'date', label: 'Voucher Date', width: 140 },
  { id: 'totalQuantity', label: 'Quantity', width: 140 },
  { id: 'totalAmount', label: 'Price', width: 140 },
  { id: 'is_synced', label: 'Synced', width: 110 },
  { id: 'createdAt', label: 'Created At', width: 140 },

  { id: '', width: 88 },
];

const defaultFilters = {
  party_name: '',
  status: 'all',
  startDate: new Date(),
  endDate: new Date(),
};

// ----------------------------------------------------------------------

export default function VoucherListView() {
  const table = useTable({ defaultOrderBy: 'id' });

  const settings = useSettingsContext();

  const router = useRouter();

  const pathname = usePathname();
  const confirm = useBoolean();
  const { enqueueSnackbar } = useSnackbar();
  const [tableData, setTableData] = useState([]);

  const { vouchers, vouchersLoading, vouchersEmpty, refreshVouchers } = useGetVouchers();

  const [filters, setFilters] = useState(defaultFilters);

  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
    dateError,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const canReset =
    !!filters.name || filters.status !== 'all' || (!!filters.startDate && !!filters.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (party_name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [party_name]: value,
      }));
    },
    [table]
  );

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleResetFilters = useCallback(() => {
    setFilters({
      party_name: '',
      status: 'all',
      startDate: null,
      endDate: null,
    });
  }, []);

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.voucher.details(id));
    },
    [router]
  );

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.voucher.edit(id));
    },
    [router]
  );

  const handleSyncVoucher = useCallback(
    async (voucher) => {
      await axiosInstance.post('/api/vouchers/syncToTally', voucher).then((res) => {
        const { data } = res;

        console.log(typeof data.HEADER.STATUS[0]);

        console.log(data.HEADER.STATUS[0]);

        if (data.HEADER.STATUS[0] === '1') {
          refreshVouchers();
          enqueueSnackbar('voucher synced successfully!');
        } else {
          enqueueSnackbar('Voucher sync failed!', {
            variant: 'error',
          });
        }
      });
    },
    [enqueueSnackbar, refreshVouchers]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  useEffect(() => {
    if (vouchers.length) {
      setTableData(vouchers);
    }
  }, [vouchers]);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        {pathname === '/dashboard' ? null : (
          <CustomBreadcrumbs
            heading="List"
            links={[
              {
                name: 'Dashboard',
                href: paths.dashboard.root,
              },
              {
                name: 'Voucher',
                href: paths.dashboard.voucher.root,
              },
              { name: 'List' },
            ]}
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />
        )}

        <Card>
          {/* <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                    }
                    color={
                      (tab.value === 'completed' && 'success') ||
                      (tab.value === 'pending' && 'warning') ||
                      (tab.value === 'cancelled' && 'error') ||
                      'default'
                    }
                  >
                    {tab.value === 'all' && _orders.length}
                    {tab.value === 'completed' &&
                      _orders.filter((order) => order.status === 'completed').length}

                    {tab.value === 'pending' &&
                      _orders.filter((order) => order.status === 'pending').length}
                    {tab.value === 'cancelled' &&
                      _orders.filter((order) => order.status === 'cancelled').length}
                    {tab.value === 'refunded' &&
                      _orders.filter((order) => order.status === 'refunded').length}
                  </Label>
                }
              />
            ))}
          </Tabs> */}

          <VoucherTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            canReset={canReset}
            onResetFilters={handleResetFilters}
          />

          {canReset && (
            <VoucherTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) => {
                    const syncedRows = tableData.filter((row) => row.is_synced === 0);
                    const syncedIds = syncedRows.map((row) => row.id);

                    table.onSelectAllRows(checked, syncedIds);
                  }}
                />

                <TableBody>
                  {vouchersLoading ? (
                    [...Array(table.rowsPerPage)].map((i, index) => (
                      <TableSkeleton key={index} sx={{ height: denseHeight }} />
                    ))
                  ) : (
                    <>
                      {dataFiltered
                        .slice(
                          table.page * table.rowsPerPage,
                          table.page * table.rowsPerPage + table.rowsPerPage
                        )
                        .map((row) => (
                          <VoucherTableRow
                            key={row.id}
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
                            onDeleteRow={() => handleDeleteRow(row.id)}
                            onViewRow={() => handleViewRow(row.id)}
                            onEditRow={() => {
                              handleEditRow(row.id);
                            }}
                            onSyncVoucher={() => {
                              handleSyncVoucher(row);
                            }}
                          />
                        ))}
                    </>
                  )}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { status, name, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (order) =>
        `${order.id}`.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        order.party_name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((order) => order.status === status);
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(
        (order) =>
          fTimestamp(order.createdAt) >= fTimestamp(startDate) &&
          fTimestamp(order.createdAt) <= fTimestamp(endDate)
      );
    }
  }

  return inputData;
}
