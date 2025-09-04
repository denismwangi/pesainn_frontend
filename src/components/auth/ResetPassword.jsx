import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import { ResetTokenManager, ResetDataManager } from '../../utils/storage';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Email,
  Phone,
  ArrowBack,
  CheckCircle
} from '@mui/icons-material';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [resetType, setResetType] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (resetType === 'email') {
      if (!email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Please enter a valid email';
      }
    } else {
      if (!phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\+?[\d\s-()]+$/.test(phone) || phone.length < 10) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        const result = await authService.initiatePasswordReset(
          resetType === 'email' ? email : phone,
          resetType
        );
        
        if (result.success && result.resetToken) {
          // Store reset token and data for OTP verification
          ResetTokenManager.setResetToken(result.resetToken);
          ResetDataManager.setResetData({
            type: resetType,
            identifier: resetType === 'email' ? email : phone,
            resetToken: result.resetToken,
            userId: result.user?.id || result.user?._id || result.user
          });
          
          setIsSubmitted(true);
          setNotification({
            open: true,
            message: result.message,
            severity: 'success'
          });
          
          // Navigate to OTP verification with reset token and userId
          setTimeout(() => {
            navigate('/otp-verification', { 
              state: { 
                resetData: {
                  type: resetType,
                  identifier: resetType === 'email' ? email : phone,
                  resetToken: result.resetToken,
                  userId: result.user?.id || result.user?._id || result.user
                }
              } 
            });
          }, 2000);
        } else {
          throw new Error(result.message || 'Failed to send reset code');
        }
      } catch (error) {
        console.error('Reset password error:', error);
        setNotification({
          open: true,
          message: error.message || 'Failed to send reset code. Please try again.',
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResetTypeChange = (event, newType) => {
    if (newType !== null) {
      setResetType(newType);
      setErrors({});
    }
  };

  if (isSubmitted) {
    return (
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              borderRadius: 2,
            }}
          >
            <CheckCircle sx={{ fontSize: 80, color: '#42956c', mb: 2 }} />
            <Typography component="h1" variant="h5" fontWeight="bold">
              Check Your {resetType === 'email' ? 'Email' : 'Phone'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              We've sent a verification code to your {resetType === 'email' ? 'email address' : 'phone number'}.
              Please check and enter the code to reset your password.
            </Typography>
            <Stack spacing={2} sx={{ width: '100%', mt: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setIsSubmitted(false)}
                sx={{
                  borderColor: '#42956c',
                  color: '#42956c',
                  '&:hover': {
                    borderColor: '#357a59',
                    backgroundColor: 'rgba(66, 149, 108, 0.04)',
                  },
                }}
              >
                Didn't receive code? Try again
              </Button>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button fullWidth color="inherit">
                  Back to Login
                </Button>
              </Link>
            </Stack>
          </Paper>
        </Box>
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          <Alert
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 2,
            position: 'relative',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 2 }}>
            <IconButton
              onClick={() => navigate('/login')}
              sx={{
                mr: 1,
                color: 'text.secondary',
              }}
            >
              <ArrowBack />
            </IconButton>
            <Typography component="h1" variant="h6" fontWeight="bold" color="primary.main" sx={{ flex: 1, textAlign: 'center', mr: 5 }}>
              Reset Password
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            Enter your {resetType === 'email' ? 'email address' : 'phone number'} and we'll send you a verification code
          </Typography>

          <ToggleButtonGroup
            color="primary"
            value={resetType}
            exclusive
            onChange={handleResetTypeChange}
            sx={{ mt: 3, mb: 3 }}
            fullWidth
          >
            <ToggleButton value="email" sx={{ py: 1.5 }}>
              <Email sx={{ mr: 1 }} />
              Email
            </ToggleButton>
            <ToggleButton value="phone" sx={{ py: 1.5 }}>
              <Phone sx={{ mr: 1 }} />
              Phone
            </ToggleButton>
          </ToggleButtonGroup>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Stack spacing={2}>
              {resetType === 'email' ? (
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  autoComplete="email"
                  autoFocus
                />
              ) : (
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  autoComplete="tel"
                  autoFocus
                />
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  mt: 2,
                  py: 1.5,
                  backgroundColor: '#42956c',
                  '&:hover': {
                    backgroundColor: '#357a59',
                  },
                }}
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ResetPassword;