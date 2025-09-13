import { useState, useEffect } from 'react';
import transactionService from '../../services/transactionService';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Avatar,
  CircularProgress,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Search,
  FilterList,
  ArrowUpward,
  ArrowDownward,
  Refresh,
  Cancel,
  Close
} from '@mui/icons-material';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, transaction: null, action: null });
  const [processing, setProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const transactionTypes = ['credit', 'debit', 'loanRepayment', 'loanCredit'];
  const transactionCategories = [
    'transfer', 'deposit', 'withdrawal', 'payment', 'refund', 
    'fee', 'bonus', 'other', 'salary', 'loanPayment', 'loanCredit'
  ];

  useEffect(() => {
    fetchTransactions();
  }, [page, rowsPerPage, filterType, filterCategory, filterStatus]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filterType !== 'all') filters.type = filterType;
      if (filterCategory !== 'all') filters.category = filterCategory;
      if (filterStatus !== 'all') filters.status = filterStatus;

      const result = await transactionService.getTransactions(page, rowsPerPage, filters);
      if (result.success) {
        setTransactions(result.transactions);
        setTotalTransactions(result.pagination?.totalTransactions || 0);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleRefresh = () => {
    fetchTransactions();
  };

  const handleOpenConfirmDialog = (transaction, action) => {
    setConfirmDialog({ open: true, transaction, action });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, transaction: null, action: null });
  };

  const handleConfirmAction = async () => {
    const { transaction, action } = confirmDialog;
    if (!transaction || !action) return;

    setProcessing(true);
    try {
      // Here you would call the actual API to perform the action
      // For example: await transactionService.revertTransaction(transaction._id);
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSnackbar({
        open: true,
        message: `Transaction ${action} successfully`,
        severity: 'success'
      });
      
      handleCloseConfirmDialog();
      // Refresh transactions list
      await fetchTransactions();
    } catch (error) {
      console.error(`Error ${action} transaction:`, error);
      setSnackbar({
        open: true,
        message: `Failed to ${action} transaction`,
        severity: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'credit': return '#42956c';
      case 'debit': return '#f44336';
      case 'loanRepayment': return '#ff9800';
      case 'loanCredit': return '#2196f3';
      default: return '#757575';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'salary': return '#42956c';
      case 'loanPayment': return '#ff9800';
      case 'loanCredit': return '#2196f3';
      case 'transfer': return '#9c27b0';
      case 'deposit': return '#00bcd4';
      case 'withdrawal': return '#f44336';
      case 'payment': return '#ff5722';
      case 'refund': return '#4caf50';
      case 'fee': return '#795548';
      case 'bonus': return '#673ab7';
      case 'other': return '#757575';
      default: return '#757575';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const fullName = `${transaction.firstName || ''} ${transaction.lastName || ''}`.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    return fullName.includes(searchLower) ||
           (transaction.email || '').toLowerCase().includes(searchLower) ||
           (transaction.transactionId || '').toLowerCase().includes(searchLower) ||
           (transaction.reference || '').toLowerCase().includes(searchLower);
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Transactions
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View all financial transactions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton onClick={handleRefresh} sx={{ color: '#42956c' }}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by name, email, transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 250 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              displayEmpty
              startAdornment={<FilterList sx={{ mr: 1, fontSize: 20, color: 'action.active' }} />}
            >
              <MenuItem value="all">All Types</MenuItem>
              {transactionTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type.replace(/([A-Z])/g, ' $1').trim()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              displayEmpty
            >
              <MenuItem value="all">All Categories</MenuItem>
              {transactionCategories.map(category => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              displayEmpty
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                    <Typography variant="body1" color="text.secondary">
                      No transactions found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {transaction.transactionId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(transaction.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: '#42956c' }}>
                          {transaction.firstName && transaction.lastName
                            ? `${transaction.firstName[0]}${transaction.lastName[0]}`.toUpperCase()
                            : 'U'
                          }
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {`${transaction.firstName || ''} ${transaction.lastName || ''}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {transaction.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type?.replace(/([A-Z])/g, ' $1').trim() || 'N/A'}
                        size="small"
                        sx={{
                          backgroundColor: `${getTypeColor(transaction.type)}20`,
                          color: getTypeColor(transaction.type),
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.category?.charAt(0).toUpperCase() + transaction.category?.slice(1) || 'N/A'}
                        size="small"
                        sx={{
                          backgroundColor: `${getCategoryColor(transaction.category)}20`,
                          color: getCategoryColor(transaction.category),
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {transaction.reference}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        {transaction.type === 'credit' || transaction.type === 'loanCredit' ? (
                          <ArrowDownward sx={{ fontSize: 16, color: '#f44336' }} />
                        ) : (
                          <ArrowUpward sx={{ fontSize: 16, color: '#42956c' }} />
                        )}
                        <Typography 
                          variant="body2" 
                          fontWeight="bold"
                          sx={{ 
                            color: transaction.type === 'credit' || transaction.type === 'loanCredit' ? '#f44336' : '#42956c'
                          }}
                        >
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        size="small"
                        color={getStatusColor(transaction.status)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {transaction.status === 'completed' && (
                        <IconButton
                          size="small"
                          onClick={() => handleOpenConfirmDialog(transaction, 'revert')}
                          sx={{ color: '#f44336' }}
                          title="Revert Transaction"
                        >
                          <Cancel />
                        </IconButton>
                      )}
                      {transaction.status === 'pending' && (
                        <IconButton
                          size="small"
                          onClick={() => handleOpenConfirmDialog(transaction, 'cancel')}
                          sx={{ color: '#ff9800' }}
                          title="Cancel Transaction"
                        >
                          <Close />
                        </IconButton>
                      )}
                      {(transaction.status === 'failed' || transaction.status === 'processing') && (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalTransactions}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmDialog.open} 
        onClose={handleCloseConfirmDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {confirmDialog.action === 'revert' ? 'Revert Transaction' : 'Cancel Transaction'}
            <IconButton onClick={handleCloseConfirmDialog} size="small" disabled={processing}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to {confirmDialog.action} this transaction?
          </Typography>
          {confirmDialog.transaction && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
              <Typography variant="body2">
                <strong>Transaction ID:</strong> {confirmDialog.transaction.transactionId}
              </Typography>
              <Typography variant="body2">
                <strong>User:</strong> {confirmDialog.transaction.firstName} {confirmDialog.transaction.lastName}
              </Typography>
              <Typography variant="body2">
                <strong>Amount:</strong> {formatCurrency(confirmDialog.transaction.amount)}
              </Typography>
              <Typography variant="body2">
                <strong>Type:</strong> {confirmDialog.transaction.type}
              </Typography>
              <Typography variant="body2">
                <strong>Category:</strong> {confirmDialog.transaction.category}
              </Typography>
            </Box>
          )}
          <Alert severity="warning" sx={{ mt: 2 }}>
            {confirmDialog.action === 'revert' 
              ? 'This action will reverse the transaction and restore the previous state. This cannot be undone.'
              : 'This action will cancel the pending transaction. This cannot be undone.'
            }
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseConfirmDialog} disabled={processing}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAction}
            variant="contained"
            disabled={processing}
            color={confirmDialog.action === 'revert' ? 'error' : 'warning'}
          >
            {processing ? <CircularProgress size={20} color="inherit" /> : `${confirmDialog.action === 'revert' ? 'Revert' : 'Cancel'} Transaction`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Transactions;