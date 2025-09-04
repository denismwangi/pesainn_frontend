import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  Stack,
  LinearProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ArrowBack,
  CheckCircleOutline
} from '@mui/icons-material';

const UpdatePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isUpdated, setIsUpdated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const resetData = location.state || {};

  const getPasswordStrength = () => {
    const len = password.length;
    let percentage = 0;
    let color = '#e0e0e0';
    let label = '';
    
    if (len === 0) {
      return { percentage: 0, color, label };
    } else if (len < 6) {
      percentage = (len / 6) * 50;
      color = '#f44336';
      label = 'Too Short';
    } else if (len >= 6 && len < 10) {
      percentage = 60;
      color = '#ff9800';
      label = 'Fair';
    } else if (len >= 10 && len < 14) {
      percentage = 80;
      color = '#4caf50';
      label = 'Good';
    } else {
      percentage = 100;
      color = '#42956c';
      label = 'Strong';
    }
    
    return { percentage, color, label };
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        // Get userId from location state (passed from OTP verification)
        const userId = resetData.userId || location.state?.userId;
        
        if (!userId) {
          setErrors({ password: 'Invalid session. Please restart the password reset process.' });
          setIsLoading(false);
          return;
        }
        
        // Call the password reset update API
        const result = await authService.updateResetPassword(password, userId);
        
        if (result.success) {
          console.log('Password updated successfully');
          setIsUpdated(true);
          // Redirect to login after 2 seconds
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setErrors({ password: result.message || 'Failed to update password' });
        }
      } catch (error) {
        console.error('Password update error:', error);
        setErrors({ password: 'Failed to update password. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isUpdated) {
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
            <CheckCircleOutline sx={{ fontSize: 80, color: '#42956c', mb: 2 }} />
            <Typography component="h1" variant="h4" fontWeight="bold">
              Password Updated!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 3, textAlign: 'center' }}>
              Your password has been successfully updated. You can now sign in with your new password.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                py: 1.5,
                backgroundColor: '#42956c',
                '&:hover': {
                  backgroundColor: '#357a59',
                },
              }}
            >
              Go to Login
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  const strengthInfo = getPasswordStrength();

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
              onClick={() => navigate('/otp-verification')}
              sx={{
                mr: 1,
                color: 'text.secondary',
              }}
            >
              <ArrowBack />
            </IconButton>
            <Typography component="h1" variant="h6" fontWeight="bold" color="primary.main" sx={{ flex: 1, textAlign: 'center', mr: 5 }}>
              Create New Password
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3, textAlign: 'center' }}>
            Choose a strong password to protect your account
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="New Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
                autoFocus
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {password && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ flex: 1, mr: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={strengthInfo.percentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: strengthInfo.color,
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                    {strengthInfo.label && (
                      <Typography
                        variant="caption"
                        fontWeight="bold"
                        sx={{ color: strengthInfo.color, minWidth: 60 }}
                      >
                        {strengthInfo.label}
                      </Typography>
                    )}
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    Password must be at least 6 characters long
                  </Typography>
                </Box>
              )}

              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={!password || !confirmPassword || isLoading}
                sx={{
                  mt: 2,
                  py: 1.5,
                  backgroundColor: '#42956c',
                  '&:hover': {
                    backgroundColor: '#357a59',
                  },
                }}
              >
                {isLoading ? 'Updating Password...' : 'Update Password'}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default UpdatePassword;