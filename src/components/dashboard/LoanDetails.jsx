import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import loanService from '../../services/loanService';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  Person,
  AttachMoney,
  Schedule,
  CheckCircle,
  Cancel,
  BusinessCenter,
  CalendarToday,
  Percent,
  Payment
} from '@mui/icons-material';

const LoanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchLoanDetails();
  }, [id]);

  const fetchLoanDetails = async () => {
    setLoading(true);
    try {
      const result = await loanService.getLoanById(id);
      if (result.success) {
        setLoan(result.loan);
      } else {
        console.error('Failed to fetch loan details:', result.message);
      }
    } catch (error) {
      console.error('Error fetching loan details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'paid': return 'primary';
      default: return 'default';
    }
  };

  const handleOpenPaymentDialog = () => {
    const totalAmount = loan.amount + (loan.interest || 0);
    const remainingAmount = totalAmount - (loan.paidAmount || 0);
    setPaymentAmount(remainingAmount.toString());
    setPaymentDialog(true);
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialog(false);
    setPaymentAmount('');
  };

  const handleProcessPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid payment amount',
        severity: 'error'
      });
      return;
    }

    setProcessing(true);
    try {
      const result = await loanService.receivePayment(id, paymentAmount);
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: result.message || 'Payment processed successfully',
          severity: 'success'
        });
        
        handleClosePaymentDialog();
        // Refresh loan details to show updated payment
        await fetchLoanDetails();
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to process payment',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setSnackbar({
        open: true,
        message: 'Failed to process payment',
        severity: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!loan) {
    return (
      <Box>
        <Typography variant="h5">Loan not found</Typography>
        <Button onClick={() => navigate('/dashboard/loans')} startIcon={<ArrowBack />}>
          Back to Loans
        </Button>
      </Box>
    );
  }

  const totalAmount = loan.amount + (loan.interest || 0);
  const remainingAmount = totalAmount - (loan.paidAmount || 0);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/dashboard/loans')} 
          sx={{ mr: 2, color: '#42956c' }}
        >
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" fontWeight="bold">
            Loan Details
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ID: {loan._id}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {remainingAmount > 0 && loan.status?.toLowerCase() === 'approved' && (
            <Button
              variant="contained"
              startIcon={<Payment />}
              onClick={handleOpenPaymentDialog}
              sx={{
                backgroundColor: '#42956c',
                '&:hover': { backgroundColor: '#357a59' }
              }}
            >
              Receive Payment
            </Button>
          )}
          <Chip 
            label={loan.status}
            color={getStatusColor(loan.status)}
            size="large"
          />
        </Box>
      </Box>

      {/* Single Container for All Loan Details */}
      <Paper sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {/* Employee Information Section */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Person sx={{ mr: 1, color: '#42956c' }} />
              <Typography variant="h6" fontWeight="bold">
                Employee Information
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">Name</Typography>
                <Typography variant="body1" fontWeight="500">
                  {loan.userId?.firstName} {loan.userId?.lastName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1" fontWeight="500">{loan.userId?.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">Phone</Typography>
                <Typography variant="body1" fontWeight="500">{loan.userId?.phone}</Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Loan Information Section */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
              <AttachMoney sx={{ mr: 1, color: '#42956c' }} />
              <Typography variant="h6" fontWeight="bold">
                Loan Information
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">Loan Type</Typography>
                <Typography variant="body1" fontWeight="500">{loan.loanType}</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">Principal Amount</Typography>
                <Typography variant="body1" fontWeight="500">{formatCurrency(loan.amount)}</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">Interest</Typography>
                <Typography variant="body1" fontWeight="500">
                  {formatCurrency(loan.interest)} ({loan.interestRate}% {loan.interestType})
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {formatCurrency(totalAmount)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Payment Information Section */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
              <Schedule sx={{ mr: 1, color: '#42956c' }} />
              <Typography variant="h6" fontWeight="bold">
                Payment Information
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">Due Date</Typography>
                <Typography variant="body1" fontWeight="500">{formatDate(loan.dueDate)}</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">Paid Amount</Typography>
                <Typography variant="body1" fontWeight="500" color="success.main">
                  {formatCurrency(loan.paidAmount || 0)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">Remaining Amount</Typography>
                <Typography variant="body1" fontWeight="bold" color={remainingAmount > 0 ? 'error.main' : 'success.main'}>
                  {formatCurrency(remainingAmount)}
                </Typography>
              </Grid>
              {loan.paidOn && (
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">Paid On</Typography>
                  <Typography variant="body1" fontWeight="500">{formatDateTime(loan.paidOn)}</Typography>
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* Business & Approval Information Section */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
              <BusinessCenter sx={{ mr: 1, color: '#42956c' }} />
              <Typography variant="h6" fontWeight="bold">
                Business & Approval Details
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">Business Name</Typography>
                <Typography variant="body1" fontWeight="500">{loan.businessName}</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">Business Number</Typography>
                <Typography variant="body1" fontWeight="500">{loan.businessNumber}</Typography>
              </Grid>
              {loan.approvedOn && (
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">Approved On</Typography>
                  <Typography variant="body1" fontWeight="500">{formatDateTime(loan.approvedOn)}</Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">Created At</Typography>
                <Typography variant="body1" fontWeight="500">{formatDateTime(loan.createdAt)}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Principal
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(loan.amount)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Interest
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(loan.interest || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Paid
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {formatCurrency(loan.paidAmount || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Remaining
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  {formatCurrency(remainingAmount)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialog}
        onClose={handleClosePaymentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Receive Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Employee: {loan?.userId?.firstName} {loan?.userId?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Amount: {formatCurrency(loan?.amount + (loan?.interest || 0))}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Paid Amount: {formatCurrency(loan?.paidAmount || 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Remaining Amount: {formatCurrency(remainingAmount)}
            </Typography>
            <TextField
              margin="normal"
              label="Payment Amount"
              type="number"
              fullWidth
              variant="outlined"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              slotProps={{
                htmlInput: { 
                  min: 0, 
                  max: remainingAmount,
                  step: 0.01 
                }
              }}
              helperText={`Enter amount (Max: ${formatCurrency(remainingAmount)})`}
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog} disabled={processing}>
            Cancel
          </Button>
          <Button 
            onClick={handleProcessPayment} 
            variant="contained"
            disabled={processing || !paymentAmount || parseFloat(paymentAmount) <= 0}
            sx={{
              backgroundColor: '#42956c',
              '&:hover': { backgroundColor: '#357a59' }
            }}
          >
            {processing ? <CircularProgress size={24} /> : 'Process Payment'}
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

export default LoanDetails;