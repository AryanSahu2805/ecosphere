import { useState, useMemo } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TableSortLabel, TablePagination,
  InputAdornment, TextField, Typography, Button,
} from '@mui/material';
import { Search, FilterList, Download } from '@mui/icons-material';
import EmptyState from './EmptyState';
import { TableSkeleton } from './SkeletonLoader';
import { tokens } from '../../theme/theme';

export default function DataTable({
  columns,          // [{ key, label, render?, sortable?, width?, align? }]
  rows,             // array of objects
  loading = false,
  searchable = true,
  searchKeys,       // keys to search within, defaults to all
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or create a new record.',
  emptyEmoji = '📋',
  onEmptyAction,
  emptyActionLabel,
  rowsPerPageOptions = [10, 25, 50],
  defaultRowsPerPage = 10,
  stickyHeader = true,
  toolbar,          // extra toolbar nodes
}) {
  const [search, setSearch] = useState('');
  const [order, setOrder]   = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [page, setPage]       = useState(0);
  const [rpp, setRpp]         = useState(defaultRowsPerPage);

  const keys = searchKeys || columns.map(c => c.key);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(row =>
      keys.some(k => String(row[k] ?? '').toLowerCase().includes(q))
    );
  }, [rows, search, keys]);

  const sorted = useMemo(() => {
    if (!orderBy) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[orderBy] ?? '';
      const bv = b[orderBy] ?? '';
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return order === 'asc' ? cmp : -cmp;
    });
  }, [filtered, order, orderBy]);

  const paginated = sorted.slice(page * rpp, page * rpp + rpp);

  const handleSort = (key) => {
    if (orderBy === key) setOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setOrderBy(key); setOrder('asc'); }
  };

  return (
    <Box sx={{
      bgcolor: 'background.paper',
      borderRadius: `${tokens.radius.card}px`,
      border: `1px solid ${tokens.colors.border}`,
      overflow: 'hidden',
    }}>
      {/* Toolbar */}
      {(searchable || toolbar) && (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 2,
          px: 2.5, py: 2,
          borderBottom: `1px solid ${tokens.colors.border}`,
          bgcolor: tokens.colors.card,
        }}>
          {searchable && (
            <TextField
              placeholder="Search…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              size="small"
              sx={{ width: 280 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 16, color: tokens.colors.textMuted }} />
                  </InputAdornment>
                ),
              }}
            />
          )}
          <Box sx={{ flex: 1 }} />
          {toolbar}
          {/* Row count */}
          <Typography sx={{ fontSize: 13, color: tokens.colors.textSec, whiteSpace: 'nowrap' }}>
            {filtered.length} record{filtered.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      )}

      {/* Table */}
      <TableContainer sx={{ maxHeight: stickyHeader ? 520 : undefined, overflowY: 'auto' }}>
        <Table stickyHeader={stickyHeader} size="medium">
          <TableHead>
            <TableRow>
              {columns.map(col => (
                <TableCell
                  key={col.key}
                  align={col.align || 'left'}
                  style={{ width: col.width }}>
                  {col.sortable !== false && !loading ? (
                    <TableSortLabel
                      active={orderBy === col.key}
                      direction={orderBy === col.key ? order : 'asc'}
                      onClick={() => handleSort(col.key)}
                      sx={{
                        '& .MuiTableSortLabel-icon': { fontSize: 14 },
                        '&.Mui-active': { color: tokens.colors.primary },
                      }}>
                      {col.label}
                    </TableSortLabel>
                  ) : col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ p: 0, border: 'none' }}>
                  <TableSkeleton rows={5} cols={columns.length} />
                </TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ border: 'none', p: 0 }}>
                  <EmptyState
                    emoji={emptyEmoji}
                    title={search ? 'No results found' : emptyTitle}
                    description={search ? `No records match "${search}". Try a different search.` : emptyDescription}
                    action={!search ? onEmptyAction : undefined}
                    actionLabel={emptyActionLabel}
                    compact
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row, ri) => (
                <TableRow key={row.id ?? ri} hover>
                  {columns.map(col => (
                    <TableCell key={col.key} align={col.align || 'left'}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {!loading && sorted.length > rpp && (
        <Box sx={{ borderTop: `1px solid ${tokens.colors.border}`, bgcolor: tokens.colors.surface }}>
          <TablePagination
            component="div"
            count={sorted.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rpp}
            onRowsPerPageChange={e => { setRpp(+e.target.value); setPage(0); }}
            rowsPerPageOptions={rowsPerPageOptions}
            sx={{ '& .MuiTablePagination-toolbar': { minHeight: 48, fontSize: 13 } }}
          />
        </Box>
      )}
    </Box>
  );
}
