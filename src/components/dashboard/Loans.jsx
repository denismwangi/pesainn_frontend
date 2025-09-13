import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import loanService from '../../services/loanService';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  Schedule,
  Add,
  CheckCircle,
  Cancel,
  AccountBalance,
  Paid,
  MonetizationOn
} from '@mui/icons-material';

const Loans = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({});
  const [loans, setLoans] = useState([]);
  const [updating, setUpdating] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, loan: null, action: null });

  useEffect(() => {
    fetchLoanStatistics();
  }, []);

  const fetchLoanStatistics = async () => {
    setLoading(true);
    try {
      const result = await loanService.getLoansWithUserInfo(1, 10);
      if (result.success) {
        setStatistics(result.statistics || {});
        setLoans(result.loans || []);
      } else {
        console.warn('Failed to fetch loan statistics:', result.message);
        setStatistics({});
        setLoans([]);
      }
    } catch (error) {
      console.error('Failed to fetch loan statistics:', error);
      setStatistics({});
      setLoans([]);
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

  const loanStats = [
    { 
      label: 'Pending Approval', 
      value: loading ? '...' : `${statistics.pendingApproval || 0}`, 
      icon: <Schedule />, 
      color: '#ff9800' 
    },
    { 
      label: 'Pending Amount', 
      value: loading ? '...' : formatCurrency(statistics.pendingApprovalAmount || 0), 
      icon: <AttachMoney />, 
      color: '#f44336' 
    },
    { 
      label: 'Approved Loans', 
      value: loading ? '...' : `${statistics.approvedLoans || 0}`, 
      icon: <CheckCircle />, 
      color: '#42956c' 
    },
    { 
      label: 'Approved Amount', 
      value: loading ? '...' : formatCurrency(statistics.approvedAmount || 0), 
      icon: <TrendingUp />, 
      color: '#2196f3' 
    },
    { 
      label: 'Loans Paid', 
      value: loading ? '...' : `${statistics.loansPaid || 0}`, 
      icon: <Paid />, 
      color: '#4caf50' 
    },
    { 
      label: 'Paid Amount', 
      value: loading ? '...' : formatCurrency(statistics.paidAmount || 0), 
      icon: <AccountBalance />, 
      color: '#00bcd4' 
    },
    { 
      label: 'Interest Earned', 
      value: loading ? '...' : formatCurrency(statistics.interestEarned || 0), 
      icon: <MonetizationOn />, 
      color: '#9c27b0' 
    },
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'paid': return 'primary';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleOpenConfirmDialog = (loan, action) => {
    setConfirmDialog({ open: true, loan, action });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, loan: null, action: null });
  };

  const handleConfirmStatusUpdate = async () => {
    const { loan, action } = confirmDialog;
    const loanId = loan._id || loan.id;
    
    handleCloseConfirmDialog();
    setUpdating(loanId);
    
    try {
      const result = await loanService.updateLoanStatus(loanId, action);
      if (result.success) {
        // Refresh the loans list
        await fetchLoanStatistics();
      } else {
        console.error('Failed to update loan status:', result.message);
      }
    } catch (error) {
      console.error('Error updating loan status:', error);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Loan Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage employee loans
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/loan-request')}
          sx={{ backgroundColor: '#42956c', '&:hover': { backgroundColor: '#357a59' } }}
        >
          New Loan Request
        </Button>
      </Box>

 <Box sx={{ width: '100%', mb: 3 }}>
           <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>

          {loanStats.slice(0, 4).map((stat, index) => (
              <Card key={index} sx={{ width: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        {stat.label}
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" sx={{ mt: 1, color: stat.color }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Box sx={{ color: stat.color, opacity: 0.3, fontSize: 40 }}>
                      {stat.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
           
          ))}
       
          </Box>
      </Box>
 <Box sx={{ width: '100%', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {loanStats.slice(4).map((stat, index) => (
              <Card key={index} sx={{ width: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        {stat.label}
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" sx={{ mt: 1, color: stat.color }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Box sx={{ color: stat.color, opacity: 0.3, fontSize: 40 }}>
                      {stat.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
           
          ))}
     
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
          Loan Applications
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Loan Type</TableCell>
                <TableCell>Interest Rate</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
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
              ) : loans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography variant="body1" color="text.secondary">
                      No loans found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                loans.map((loan) => {
                  return (
                    <TableRow 
                      key={loan.id}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                      onClick={() => navigate(`/loans/${loan._id || loan.id}`)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#42956c', width: 32, height: 32, fontSize: 14 }}>
                            {loan.user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">{loan.user?.fullName || 'Unknown'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {loan.user?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(loan.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>{loan.loanType}</TableCell>
                      <TableCell>{loan.interestRate}% {loan.interestType}</TableCell>
                      <TableCell>{formatDate(loan.dueDate)}</TableCell>
                      <TableCell>
                        <Chip
                          label={loan.status}
                          size="small"
                          color={getStatusColor(loan.status)}
                        />
                      </TableCell>
                  <TableCell align="center">
                    {loan.status?.toLowerCase() === 'pending' ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenConfirmDialog(loan, 'Approved');
                          }}
                          disabled={updating === (loan._id || loan.id)}
                        >
                          {updating === (loan._id || loan.id) ? (
                            <CircularProgress size={16} />
                          ) : (
                            <CheckCircle />
                          )}
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenConfirmDialog(loan, 'Rejected');
                          }}
                          disabled={updating === (loan._id || loan.id)}
                        >
                          {updating === (loan._id || loan.id) ? (
                            <CircularProgress size={16} />
                          ) : (
                            <Cancel />
                          )}
                        </IconButton>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
                );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmDialog.action === 'Approved' ? 'Approve Loan' : 'Reject Loan'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {confirmDialog.loan && (
              <>
                Are you sure you want to {confirmDialog.action === 'Approved' ? 'approve' : 'reject'} this loan request?
                <br /><br />
                <strong>Employee:</strong> {confirmDialog.loan.user?.fullName || 'Unknown'}<br />
                <strong>Amount:</strong> {formatCurrency(confirmDialog.loan.amount)}<br />
                <strong>Loan Type:</strong> {confirmDialog.loan.loanType}<br />
                <strong>Due Date:</strong> {formatDate(confirmDialog.loan.dueDate)}
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmStatusUpdate} 
            color={confirmDialog.action === 'Approved' ? 'success' : 'error'}
            variant="contained"
            autoFocus
          >
            {confirmDialog.action === 'Approved' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Loans;