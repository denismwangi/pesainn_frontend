import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import { ResetTokenManager, ResetDataManager } from '../../utils/storage';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Stack,
  IconButton,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  Refresh
} from '@mui/icons-material';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Get reset data from location state or stored data
  const [resetData, setResetData] = useState(
    location.state?.resetData || ResetDataManager.getResetData() || { type: 'email', identifier: 'user@example.com' }
  );

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0 && !canResend) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [resendTimer, canResend]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (newOtp.every(digit => digit !== '')) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 4);
    
    if (digits.length === 4) {
      const newOtp = digits.split('');
      setOtp(newOtp);
      inputRefs[3].current?.focus();
      handleSubmit(digits);
    }
  };

  const handleSubmit = async (code) => {
    if (code.length === 4) {
      setIsLoading(true);
      try {
        // Use verifyResetOTP for password reset flow with userId
        const result = await authService.verifyResetOTP(code, resetData.userId);
        
        if (result.success) {
          // Store verification token for password update
          if (result.token) {
            ResetTokenManager.setResetToken(result.token);
          }
          
          // Navigate to update password with reset data and token
          navigate('/update-password', { 
            state: { 
              resetData: resetData,
              verificationToken: result.token,
              userId: resetData.userId
            } 
          });
        } else {
          throw new Error(result.message || 'Invalid verification code');
        }
      } catch (error) {
        console.error('OTP verification error:', error);
        setError(error.message || 'Invalid verification code. Please try again.');
        setOtp(['', '', '', '']);
        inputRefs[0].current?.focus();
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Please enter all 4 digits');
    }
  };

  const handleResend = async () => {
    if (canResend) {
      try {
        const result = await authService.initiatePasswordReset(
          resetData.identifier,
          resetData.type
        );
        
        if (result.success && result.resetToken) {
          // Update stored reset token and userId
          ResetTokenManager.setResetToken(result.resetToken);
          ResetDataManager.setResetData({
            ...resetData,
            resetToken: result.resetToken,
            userId: result.user?.id || result.user?._id || result.user
          });
          
          // Update local resetData with new userId
          setResetData(prevData => ({
            ...prevData,
            userId: result.user?.id || result.user?._id || result.user
          }));
          
          setResendTimer(60);
          setCanResend(false);
          setOtp(['', '', '', '']);
          setError('');
          inputRefs[0].current?.focus();
          
          // Could show a success snackbar here if needed
          console.log('New verification code sent successfully');
        } else {
          throw new Error(result.message || 'Failed to resend code');
        }
      } catch (error) {
        console.error('Resend error:', error);
        setError('Failed to resend code. Please try again.');
      }
    }
  };

  const formatIdentifier = () => {
    const { type, identifier } = resetData;
    if (type === 'email') {
      const [username, domain] = identifier.split('@');
      if (username && domain) {
        const maskedUsername = username.substring(0, 3) + '***';
        return `${maskedUsername}@${domain}`;
      }
      return identifier;
    } else {
      const lastFour = identifier.slice(-4);
      return `***-***-${lastFour}`;
    }
  };

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
              onClick={() => navigate('/reset-password')}
              sx={{
                mr: 1,
                color: 'text.secondary',
              }}
            >
              <ArrowBack />
            </IconButton>
            <Typography component="h1" variant="h6" fontWeight="bold" color="primary.main" sx={{ flex: 1, textAlign: 'center', mr: 5 }}>
              Verify Your Account
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            We've sent a 4-digit code to {formatIdentifier()}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, my: 4 }}>
            {otp.map((digit, index) => (
              <TextField
                key={index}
                inputRef={inputRefs[index]}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                inputProps={{
                  maxLength: 1,
                  style: {
                    textAlign: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    padding: '16px 0',
                  },
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                }}
                sx={{
                  width: 60,
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#42956c',
                      borderWidth: 2,
                    },
                  },
                }}
                error={!!error}
              />
            ))}
          </Box>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            {!canResend ? (
              <Typography variant="body2" color="text.secondary">
                Resend code in {resendTimer}s
              </Typography>
            ) : (
              <Button
                startIcon={<Refresh />}
                onClick={handleResend}
                sx={{
                  color: '#42956c',
                  '&:hover': {
                    backgroundColor: 'rgba(66, 149, 108, 0.04)',
                  },
                }}
              >
                Resend Code
              </Button>
            )}
          </Box>

          <Stack spacing={2} sx={{ width: '100%' }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => handleSubmit(otp.join(''))}
              disabled={otp.some(digit => digit === '') || isLoading}
              sx={{
                py: 1.5,
                backgroundColor: '#42956c',
                '&:hover': {
                  backgroundColor: '#357a59',
                },
              }}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              Didn't receive the code? Check your spam folder or try resending.
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default OTPVerification;