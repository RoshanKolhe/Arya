/* eslint-disable no-unreachable */
import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';
// @mui
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
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// _mock
import { PRODUCT_STOCK_OPTIONS } from 'src/_mock';
// api
// components
import { useSettingsContext } from 'src/components/settings';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableSkeleton,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';
import { useGetLedgers } from 'src/api/ledger';
import { useGetUsers } from 'src/api/user';
import { useGetVouchers } from 'src/api/voucher';
import UserTableRow from '../voucher-table-row';
import UserTableToolbar from '../voucher-table-toolbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'date', label: 'Date' },
  { id: 'party_name', label: 'Party Name' },
  { id: 'is_synced', label: 'Synced', width: 160 },
  { id: 'createdAt', label: 'Create At', width: 160 },
  { id: '', width: 80 },
];

const defaultFilters = {
  name: '',
};

// ----------------------------------------------------------------------

export default function VoucherListView() {
  const router = useRouter();

  const table = useTable();

  const { enqueueSnackbar } = useSnackbar();

  const settings = useSettingsContext();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const { vouchers, vouchersLoading, vouchersEmpty, refreshVouchers } = useGetVouchers();

  const confirm = useBoolean();

  useEffect(() => {
    setTableData(vouchers);
  }, [vouchers]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 60 : 80;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || vouchersEmpty;

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.voucher.edit(id));
    },
    [router]
  );

  const handleDeleteRow = useCallback(
    async (id, deleteConfirm) => {
      await axiosInstance
        .delete(`/api/brands/${id}`)
        .then((res) => {
          enqueueSnackbar('Delete Success!');
          refreshVouchers();
        })
        .catch((err) => {
          console.error(err);
          enqueueSnackbar(
            err.response.data.error.message
              ? err.response.data.error.message
              : 'something went wrong!',
            { variant: 'error' }
          );
        });
      deleteConfirm.onFalse();
    },
    [enqueueSnackbar, refreshVouchers]
  );

  const handleApproveOrBlock = useCallback(
    async (id, isActive) => {
      await axiosInstance
        .patch(`/api/users/${id}`, {
          isActive,
        })
        .then((res) => {
          enqueueSnackbar(!isActive ? 'Block success' : 'Unblock success');
          refreshVouchers();
        })
        .catch((err) => {
          console.error(err);
          enqueueSnackbar(
            err.response.data.error.message
              ? err.response.data.error.message
              : 'something went wrong!',
            { variant: 'error' }
          );
        });
    },
    [enqueueSnackbar, refreshVouchers]
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

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            {
              name: 'Voucher',
              href: paths.dashboard.voucher.root,
            },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.voucher.new}
              variant="contained"
              startIcon={<Iconify icon="material-symbols:add" />}
            >
              New Voucher
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <UserTableToolbar filters={filters} onFilters={handleFilters} />
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
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      tableData.map((row) => row.id)
                    )
                  }
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
                          <UserTableRow
                            key={row.id}
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
                            onDeleteRow={(deleteConfirm) => handleDeleteRow(row.id, deleteConfirm)}
                            onEditRow={() => {
                              handleEditRow(row.id);
                            }}
                            onApproveUser={(id, isActive) => handleApproveOrBlock(id, isActive)}
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

function applyFilter({ inputData, comparator, filters }) {
  const { name } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (brand) => brand.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }
  return inputData;
}
