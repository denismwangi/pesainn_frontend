import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { TokenManager } from '../../utils/storage';
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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  TablePagination
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Close,
  Category,
  Percent,
  AttachMoney
} from '@mui/icons-material';

const LoanTypes = () => {
  const [loanTypes, setLoanTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedLoanType, setSelectedLoanType] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    name: '',
    interestAmount: '',
    interestType: 'Percentage',
    isActive: true
  });

  useEffect(() => {
    fetchLoanTypes();
  }, [page, rowsPerPage]);

  const fetchLoanTypes = async () => {
    setLoading(true);
    try {
      const token = TokenManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString()
      });

      const response = await fetch(`${API_ENDPOINTS.LOAN_TYPES}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setLoanTypes(data.data?.items || []);
        setTotalItems(data.data?.pagination?.totalItems || 0);
      } else {
        throw new Error(data.message || 'Failed to fetch loan types');
      }
    } catch (error) {
      console.error('Error fetching loan types:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to fetch loan types',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (loanType = null) => {
    if (loanType) {
      setEditMode(true);
      setSelectedLoanType(loanType);
      setFormData({
        name: loanType.name,
        interestAmount: loanType.interestAmount,
        interestType: loanType.interestType,
        isActive: loanType.isActive
      });
    } else {
      setEditMode(false);
      setSelectedLoanType(null);
      setFormData({
        name: '',
        interestAmount: '',
        interestType: 'Percentage',
        isActive: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setSelectedLoanType(null);
    setFormData({
      name: '',
      interestAmount: '',
      interestType: 'Percentage',
      isActive: true
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.interestAmount) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'warning'
      });
      return;
    }

    setProcessing(true);
    try {
      const token = TokenManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = editMode 
        ? `${API_ENDPOINTS.LOAN_TYPES}/${selectedLoanType._id}`
        : API_ENDPOINTS.LOAN_TYPES;

      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          interestAmount: parseFloat(formData.interestAmount)
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSnackbar({
          open: true,
          message: editMode ? 'Loan type updated successfully' : 'Loan type created successfully',
          severity: 'success'
        });
        handleCloseDialog();
        fetchLoanTypes();
      } else {
        throw new Error(data.message || 'Failed to save loan type');
      }
    } catch (error) {
      console.error('Error saving loan type:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to save loan type',
        severity: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    setProcessing(true);
    try {
      const token = TokenManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_ENDPOINTS.LOAN_TYPES}/${selectedLoanType._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSnackbar({
          open: true,
          message: 'Loan type deleted successfully',
          severity: 'success'
        });
        setDeleteDialog(false);
        setSelectedLoanType(null);
        fetchLoanTypes();
      } else {
        throw new Error(data.message || 'Failed to delete loan type');
      }
    } catch (error) {
      console.error('Error deleting loan type:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete loan type',
        severity: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Loan Types
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage different types of loans and their interest rates
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ 
            backgroundColor: '#42956c', 
            '&:hover': { backgroundColor: '#357a59' } 
          }}
        >
          Add Loan Type
        </Button>
      </Box>

      {/* Table */}
      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Interest Rate</TableCell>
                <TableCell>Interest Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : loanTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography variant="body1" color="text.secondary">
                      No loan types found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                loanTypes.map((loanType) => (
                  <TableRow key={loanType._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Category sx={{ color: '#42956c', fontSize: 20 }} />
                        <Typography variant="body2" fontWeight={500}>
                          {loanType.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {loanType.interestType === 'Percentage' ? (
                          <Percent sx={{ fontSize: 16, color: '#757575' }} />
                        ) : (
                          <AttachMoney sx={{ fontSize: 16, color: '#757575' }} />
                        )}
                        <Typography variant="body2" fontWeight={500}>
                          {loanType.interestAmount}
                          {loanType.interestType === 'Percentage' && '%'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={loanType.interestType}
                        size="small"
                        sx={{
                          backgroundColor: loanType.interestType === 'Percentage' ? '#e3f2fd' : '#fff3e0',
                          color: loanType.interestType === 'Percentage' ? '#1976d2' : '#f57c00'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={loanType.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={loanType.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(loanType.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(loanType.updatedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(loanType)}
                          sx={{ color: '#42956c' }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedLoanType(loanType);
                            setDeleteDialog(true);
                          }}
                          sx={{ color: '#f44336' }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalItems}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editMode ? 'Edit Loan Type' : 'Add New Loan Type'}
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Loan Type Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              label="Interest Amount"
              type="number"
              fullWidth
              value={formData.interestAmount}
              onChange={(e) => setFormData({ ...formData, interestAmount: e.target.value })}
              required
              slotProps={{
                htmlInput: { 
                  min: 0, 
                  step: 0.01 
                }
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Interest Type</InputLabel>
              <Select
                value={formData.interestType}
                onChange={(e) => setFormData({ ...formData, interestType: e.target.value })}
                label="Interest Type"
              >
                <MenuItem value="Percentage">Percentage</MenuItem>
                <MenuItem value="Fixed">Fixed Amount</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={processing}
            sx={{ 
              backgroundColor: '#42956c', 
              '&:hover': { backgroundColor: '#357a59' } 
            }}
          >
            {processing ? <CircularProgress size={20} color="inherit" /> : (editMode ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the loan type "{selectedLoanType?.name}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteDialog(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={processing}
          >
            {processing ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default LoanTypes;