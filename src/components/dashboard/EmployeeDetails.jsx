import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Email,
  Phone,
  Business,
  AccountBalance,
  TrendingUp,
  AccountBalanceWallet,
  DateRange,
  Person,
  CreditCard,
  Lock,
  CheckCircle,
  Cancel,
  Close,
} from '@mui/icons-material';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approving, setApproving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    basicSalary: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  const fetchEmployeeDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await userService.getEmployeeDetails(id);
      if (result.success) {
        setEmployee(result.employee);
      } else {
        setError(result.message || 'Failed to fetch employee details');
      }
    } catch (err) {
      console.error('Error fetching employee details:', err);
      setError('Failed to fetch employee details');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async () => {
    setApproving(true);
    try {
      const result = await userService.approveUser(employee.id);
      if (result.success) {
        // Show success message
        setSnackbar({
          open: true,
          message: result.message || 'User approved successfully!',
          severity: 'success'
        });
        // Refresh employee details to show updated status
        await fetchEmployeeDetails();
      } else {
        // Show error message
        setSnackbar({
          open: true,
          message: result.message || 'Failed to approve user',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error approving user:', err);
      setSnackbar({
        open: true,
        message: 'Failed to approve user. Please try again.',
        severity: 'error'
      });
    } finally {
      setApproving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenEditModal = () => {
    // Populate form with current employee data
    setEditFormData({
      firstName: employee?.firstName || '',
      lastName: employee?.lastName || '',
      email: employee?.email || '',
      phone: employee?.phone || '',
      basicSalary: employee?.basicSalary || ''
    });
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenRejectDialog = () => {
    setRejectReason('');
    setOpenRejectDialog(true);
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setRejectReason('');
  };

  const handleRejectUser = async () => {
    if (!rejectReason.trim()) {
      setSnackbar({
        open: true,
        message: 'Please provide a reason for rejection',
        severity: 'warning'
      });
      return;
    }

    setRejecting(true);
    try {
      const result = await userService.rejectUser(employee.id, rejectReason);
      if (result.success) {
        setSnackbar({
          open: true,
          message: result.message || 'User rejected successfully',
          severity: 'success'
        });
        // Refresh employee details to show updated status
        await fetchEmployeeDetails();
        handleCloseRejectDialog();
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to reject user',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error rejecting user:', err);
      setSnackbar({
        open: true,
        message: 'Failed to reject user. Please try again.',
        severity: 'error'
      });
    } finally {
      setRejecting(false);
    }
  };

  const handleSaveProfile = async () => {
    setEditLoading(true);
    try {
      // Call the update profile API
      const result = await userService.updateEmployeeProfile(employee.id, editFormData);
      if (result.success) {
        setSnackbar({
          open: true,
          message: result.message || 'Profile updated successfully!',
          severity: 'success'
        });
        // Refresh employee details
        await fetchEmployeeDetails();
        handleCloseEditModal();
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update profile',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update profile. Please try again.',
        severity: 'error'
      });
    } finally {
      setEditLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate(-1)} startIcon={<ArrowBack />}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Employee not found
        </Alert>
        <Button onClick={() => navigate(-1)} startIcon={<ArrowBack />}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="bold">
            Employee Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage employee information
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {employee?.userState === 'Pending_Approval' && (
            <>
              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                disabled={approving}
                sx={{ backgroundColor: '#42956c', '&:hover': { backgroundColor: '#357a59' } }}
                onClick={handleApproveUser}
              >
                {approving ? 'Approving...' : 'Approve User'}
              </Button>
              <Button
                variant="contained"
                startIcon={<Close />}
                disabled={rejecting}
                onClick={handleOpenRejectDialog}
                sx={{ 
                  backgroundColor: '#d32f2f', 
                  color: '#ffffff',
                  '&:hover': { backgroundColor: '#c62828' } 
                }}
              >
                {rejecting ? 'Rejecting...' : 'Reject User'}
              </Button>
            </>
          )}
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={handleOpenEditModal}
            sx={{ backgroundColor: '#42956c', '&:hover': { backgroundColor: '#357a59' } }}
          >
            Edit Employee
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
  {/* Employee Profile Card - 30% width */}
  <Box sx={{ flex: '0 0 30%', minWidth: 0 }}>
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ textAlign: 'center', py: 4 }}>
        <Avatar
          sx={{
            width: 100,
            height: 100,
            margin: '0 auto',
            mb: 2,
            bgcolor: '#42956c',
            fontSize: '2rem'
          }}
          src={employee.profilePicture}
        >
          {!employee.profilePicture && employee.firstName && employee.lastName
            ? `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase()
            : <Person />}
        </Avatar>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {employee.fullName || `${employee.firstName} ${employee.lastName}`}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          ID: {employee.id}
        </Typography>
        <Box sx={{ mt: 2, mb: 3 }}>
          <Chip
            label={employee.userState === 'Pending_Approval' ? 'Pending Approval' : (employee.userState || 'Pending Approval')}
            color={getStatusColor(employee.userState)}
            size="medium"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <List sx={{ textAlign: 'left' }}>
          <ListItem>
            <ListItemIcon>
              <Email color="action" />
            </ListItemIcon>
            <ListItemText
              primary="Email"
              secondary={employee.email}
              secondaryTypographyProps={{
                sx: {
                  wordBreak: 'break-all',
                  fontSize: '0.875rem'
                }
              }}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Phone color="action" />
            </ListItemIcon>
            <ListItemText primary="Phone" secondary={employee.phone} />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Business color="action" />
            </ListItemIcon>
            <ListItemText primary="Business" secondary={employee.businessName} />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  </Box>

  {/* Wallet & Financial Information with Quick Actions - 70% width */}
  <Box sx={{ flex: '1 1 70%', minWidth: 0 }}>
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Wallet & Financial Information
          </Typography>
          {employee.wallet && (
            <Chip
              icon={employee.wallet.isLocked ? <Lock /> : <CheckCircle />}
              label={employee.wallet.isLocked ? 'Locked' : 'Active'}
              color={employee.wallet.isLocked ? 'error' : 'success'}
              size="small"
            />
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />

        {/* First Row */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {employee.wallet && (
            <>
              <Box sx={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center' }}>
                <AccountBalanceWallet sx={{ mr: 1, color: '#42956c' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Balance</Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {formatCurrency(employee.wallet.balance || 0)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Available Balance</Typography>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    {formatCurrency(employee.wallet.availableBalance || 0)}
                  </Typography>
                </Box>
              </Box>
            </>
          )}

          <Box sx={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center' }}>
            <AccountBalance sx={{ mr: 1, color: '#42956c' }} />
            <Box>
              <Typography variant="body2" color="text.secondary">Basic Salary</Typography>
              <Typography variant="h6" fontWeight="bold">
                {formatCurrency(employee.basicSalary || 0)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Second Row - Total Loans, Daily Limit, Monthly Limit */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 3 }}>
          <Box sx={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center' }}>
            <CreditCard sx={{ mr: 1, color: '#f44336' }} />
            <Box>
              <Typography variant="body2" color="text.secondary">Total Loans</Typography>
              <Typography variant="h6" fontWeight="bold" color="error">
                {formatCurrency(employee.totalLoans || 0)}
              </Typography>
            </Box>
          </Box>

          {employee.wallet && (
            <>
              <Box sx={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ mr: 1, color: '#757575' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Daily Limit</Typography>
                  <Typography variant="h6" fontWeight="medium">
                    {formatCurrency(employee.wallet.dailyLimit || 0)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center' }}>
                <DateRange sx={{ mr: 1, color: '#757575' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Monthly Limit</Typography>
                  <Typography variant="h6" fontWeight="medium">
                    {formatCurrency(employee.wallet.monthlyLimit || 0)}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  </Box>
</Box>

      
      {/* Edit Profile Modal */}
      <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Employee Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                name="firstName"
                fullWidth
                value={editFormData.firstName}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                name="lastName"
                fullWidth
                value={editFormData.lastName}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                value={editFormData.email}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Phone"
                name="phone"
                fullWidth
                value={editFormData.phone}
                onChange={handleEditFormChange}
                helperText="Format: +254712345678"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Basic Salary (KES)"
                name="basicSalary"
                type="number"
                fullWidth
                value={editFormData.basicSalary}
                onChange={handleEditFormChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal} disabled={editLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveProfile} 
            variant="contained"
            disabled={editLoading}
            sx={{ backgroundColor: '#42956c', '&:hover': { backgroundColor: '#357a59' } }}
          >
            {editLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reject User Dialog */}
      <Dialog open={openRejectDialog} onClose={handleCloseRejectDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Reject User</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this user. This will be recorded for audit purposes.
          </Typography>
          <TextField
            label="Rejection Reason"
            name="reason"
            fullWidth
            multiline
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g., Incomplete documentation, Invalid credentials, etc."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectDialog} disabled={rejecting}>
            Cancel
          </Button>
          <Button 
            onClick={handleRejectUser} 
            variant="contained"
            disabled={rejecting || !rejectReason.trim()}
            color="error"
          >
            {rejecting ? 'Rejecting...' : 'Reject User'}
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
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeeDetails;