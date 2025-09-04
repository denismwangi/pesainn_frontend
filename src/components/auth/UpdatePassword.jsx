import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ArrowBack,
  CheckCircle,
  Cancel,
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

  const passwordRequirements = [
    { regex: /.{8,}/, text: 'At least 8 characters', key: 'length' },
    { regex: /[A-Z]/, text: 'One uppercase letter', key: 'uppercase' },
    { regex: /[a-z]/, text: 'One lowercase letter', key: 'lowercase' },
    { regex: /\d/, text: 'One number', key: 'number' },
    { regex: /[!@#$%^&*]/, text: 'One special character (!@#$%^&*)', key: 'special' },
  ];

  const validatePassword = (pwd) => {
    return passwordRequirements.every(req => req.regex.test(pwd));
  };

  const getPasswordStrength = () => {
    const metRequirements = passwordRequirements.filter(req => req.regex.test(password)).length;
    const percentage = (metRequirements / passwordRequirements.length) * 100;
    
    let color = '#e0e0e0';
    let label = '';
    
    if (metRequirements === 0) {
      return { percentage: 0, color, label };
    } else if (metRequirements <= 2) {
      color = '#f44336';
      label = 'Weak';
    } else if (metRequirements <= 4) {
      color = '#ff9800';
      label = 'Medium';
    } else {
      color = '#42956c';
      label = 'Strong';
    }
    
    return { percentage, color, label };
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password does not meet all requirements';
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
      // Simulate API call
      setTimeout(() => {
        console.log('Password updated successfully');
        setIsUpdated(true);
        setIsLoading(false);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }, 1500);
    }
  };

  if (isUpdated) {
    return (
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
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
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
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
          <IconButton
            onClick={() => navigate('/otp-verification')}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              color: 'text.secondary',
            }}
          >
            <ArrowBack />
          </IconButton>

          <Typography component="h1" variant="h4" fontWeight="bold" color="primary.main">
            Create New Password
          </Typography>
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

                  <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="caption" fontWeight="bold" gutterBottom>
                      Password requirements:
                    </Typography>
                    <List dense sx={{ py: 0 }}>
                      {passwordRequirements.map((req) => (
                        <ListItem key={req.key} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            {req.regex.test(password) ? (
                              <CheckCircle sx={{ fontSize: 18, color: '#42956c' }} />
                            ) : (
                              <Cancel sx={{ fontSize: 18, color: '#bdbdbd' }} />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={req.text}
                            primaryTypographyProps={{
                              variant: 'caption',
                              color: req.regex.test(password) ? 'text.primary' : 'text.secondary',
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
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