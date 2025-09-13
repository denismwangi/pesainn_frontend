import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import loanService from '../../services/loanService';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  DialogContentText
} from '@mui/material';
import {
  ArrowBack,
  Person,
  AttachMoney,
  Schedule,
  BusinessCenter,
  Payment,
  CheckCircle,
  Cancel
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
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);

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
      case 'Approved': return 'success';
      case 'Aending': return 'warning';
      case 'Rejected': return 'error';
      case 'Paid': return 'primary';
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

  const handleApproveLoan = async () => {
    setProcessing(true);
    try {
      const result = await loanService.updateLoanStatus(id, 'Approved');
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Loan approved successfully',
          severity: 'success'
        });
        setApproveDialog(false);
        await fetchLoanDetails();
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to approve loan',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error approving loan:', error);
      setSnackbar({
        open: true,
        message: 'Failed to approve loan',
        severity: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectLoan = async () => {
    setProcessing(true);
    try {
      const result = await loanService.updateLoanStatus(id, 'Rejected');
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Loan rejected successfully',
          severity: 'success'
        });
        setRejectDialog(false);
        await fetchLoanDetails();
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to reject loan',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error rejecting loan:', error);
      setSnackbar({
        open: true,
        message: 'Failed to reject loan',
        severity: 'error'
      });
    } finally {
      setProcessing(false);
    }
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
          {loan.status?.toLowerCase() === 'pending' && (
            <>
              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={() => setApproveDialog(true)}
                sx={{
                  backgroundColor: '#42956c',
                  '&:hover': { backgroundColor: '#357a59' }
                }}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                startIcon={<Cancel />}
                onClick={() => setRejectDialog(true)}
                sx={{
                  backgroundColor: '#f44336',
                  '&:hover': { backgroundColor: '#d32f2f' }
                }}
              >
                Reject
              </Button>
            </>
          )}
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

     <Paper sx={{ p: 4 }}>
  {/* Row 1: Employee Information + Loan Information */}
  <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
    {/* Employee Information */}
    <Box sx={{ flex: 1, minWidth: 300 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Person sx={{ mr: 1, color: '#42956c' }} />
        <Typography variant="h6" fontWeight="bold">
          Employee Information
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Box>
        <Typography variant="body2" color="text.secondary">Name</Typography>
        <Typography variant="body1" fontWeight="500">
          {loan.userId?.firstName} {loan.userId?.lastName}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Email</Typography>
        <Typography variant="body1" fontWeight="500">{loan.userId?.email}</Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Phone</Typography>
        <Typography variant="body1" fontWeight="500">{loan.userId?.phone}</Typography>
      </Box>
    </Box>

    {/* Loan Information */}
    <Box sx={{ flex: 1, minWidth: 300 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AttachMoney sx={{ mr: 1, color: '#42956c' }} />
        <Typography variant="h6" fontWeight="bold">
          Loan Information
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Box>
        <Typography variant="body2" color="text.secondary">Loan Type</Typography>
        <Typography variant="body1" fontWeight="500">{loan.loanType}</Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Principal Amount</Typography>
        <Typography variant="body1" fontWeight="500">{formatCurrency(loan.amount)}</Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Interest</Typography>
        <Typography variant="body1" fontWeight="500">
          {formatCurrency(loan.interest)} ({loan.interestRate}% {loan.interestType})
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Total Amount</Typography>
        <Typography variant="h6" fontWeight="bold" color="primary">
          {formatCurrency(totalAmount)}
        </Typography>
      </Box>
    </Box>
  </Box>

  {/* Row 2: Payment Information + Business & Approval Details */}
  <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mt: 4 }}>
    {/* Payment Information */}
    <Box sx={{ flex: 1, minWidth: 300 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Schedule sx={{ mr: 1, color: '#42956c' }} />
        <Typography variant="h6" fontWeight="bold">
          Payment Information
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Box>
        <Typography variant="body2" color="text.secondary">Due Date</Typography>
        <Typography variant="body1" fontWeight="500">{formatDate(loan.dueDate)}</Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Paid Amount</Typography>
        <Typography variant="body1" fontWeight="500" color="success.main">
          {formatCurrency(loan.paidAmount || 0)}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Remaining Amount</Typography>
        <Typography variant="body1" fontWeight="bold" color={remainingAmount > 0 ? 'error.main' : 'success.main'}>
          {formatCurrency(remainingAmount)}
        </Typography>

        {loan.paidOn && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Paid On</Typography>
            <Typography variant="body1" fontWeight="500">{formatDateTime(loan.paidOn)}</Typography>
          </>
        )}
      </Box>
    </Box>

    {/* Business & Approval Details */}
    <Box sx={{ flex: 1, minWidth: 300 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <BusinessCenter sx={{ mr: 1, color: '#42956c' }} />
        <Typography variant="h6" fontWeight="bold">
          Business & Approval Details
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Box>
        {loan.approvedOn && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Approved On</Typography>
            <Typography variant="body1" fontWeight="500">{formatDateTime(loan.approvedOn)}</Typography>
          </>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Created At</Typography>
        <Typography variant="body1" fontWeight="500">{formatDateTime(loan.createdAt)}</Typography>
      </Box>
    </Box>
  </Box>
</Paper>


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

      {/* Approve Dialog */}
      <Dialog
        open={approveDialog}
        onClose={() => setApproveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Loan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve this loan application?
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Employee:</strong> {loan?.userId?.firstName} {loan?.userId?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Loan Type:</strong> {loan?.loanType}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Amount:</strong> {formatCurrency(loan?.amount)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Total with Interest:</strong> {formatCurrency(totalAmount)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog(false)} disabled={processing}>
            Cancel
          </Button>
          <Button 
            onClick={handleApproveLoan}
            variant="contained"
            disabled={processing}
            sx={{
              backgroundColor: '#42956c',
              '&:hover': { backgroundColor: '#357a59' }
            }}
          >
            {processing ? <CircularProgress size={24} /> : 'Approve Loan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialog}
        onClose={() => setRejectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Loan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reject this loan application?
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Employee:</strong> {loan?.userId?.firstName} {loan?.userId?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Loan Type:</strong> {loan?.loanType}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Amount:</strong> {formatCurrency(loan?.amount)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)} disabled={processing}>
            Cancel
          </Button>
          <Button 
            onClick={handleRejectLoan}
            variant="contained"
            disabled={processing}
            sx={{
              backgroundColor: '#f44336',
              '&:hover': { backgroundColor: '#d32f2f' }
            }}
          >
            {processing ? <CircularProgress size={24} /> : 'Reject Loan'}
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