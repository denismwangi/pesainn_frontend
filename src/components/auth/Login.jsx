import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Phone
} from '@mui/icons-material';
import authService from '../../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('phone');
  const [email, setEmail] = useState('admin@gmail.com');
  const [phone, setPhone] = useState('+254711675033');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (loginType === 'email') {
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
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      setErrors({});
      
      const identifier = loginType === 'email' ? email : phone;
      
      try {
        // Call auth service to login
        const result = await authService.login(identifier, password, loginType);
        
        if (result.success) {
          setNotification({
            open: true,
            message: result.message || 'Login successful!',
            severity: 'success'
          });
          
          // Navigate to dashboard after successful login
          setTimeout(() => {
            navigate('/dashboard');
          }, 500);
        } else {
          setNotification({
            open: true,
            message: result.message || 'Login failed. Please check your credentials.',
            severity: 'error'
          });
        }
      } catch (error) {
        console.error('Login error:', error);
        setNotification({
          open: true,
          message: 'An unexpected error occurred. Please try again.',
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleLoginTypeChange = (event, newType) => {
    if (newType !== null) {
      setLoginType(newType);
      setErrors({});
    }
  };

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
          <Typography component="h1" variant="h4" fontWeight="bold" color="primary.main">
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Sign in to your account
          </Typography>

          <ToggleButtonGroup
            color="primary"
            value={loginType}
            exclusive
            onChange={handleLoginTypeChange}
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
              {loginType === 'email' ? (
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

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="current-password"
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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  mt: 2,
                  mb: 2,
                  py: 1.5,
                  backgroundColor: '#42956c',
                  '&:hover': {
                    backgroundColor: '#357a59',
                  },
                }}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link
                  to="/reset-password"
                  style={{
                    color: '#42956c',
                    textDecoration: 'none',
                    fontSize: '14px',
                  }}
                >
                  Forgot Password?
                </Link>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Box>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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

export default Login;