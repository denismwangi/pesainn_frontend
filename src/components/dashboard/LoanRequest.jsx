import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import loanService from '../../services/loanService';
import userService from '../../services/userService';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Autocomplete
} from '@mui/material';
import {
  ArrowBack,
  Save
} from '@mui/icons-material';

const LoanRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    loanType: 'Advanced',
    dueDate: '',
    interestRate: 0,
    interestType: 'Flat'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchLoanTypes();
  }, []);

  const fetchEmployees = async () => {
    try {
      const result = await userService.getUsersList(1, 100); // Get more employees
      if (result.success) {
        setEmployees(result.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const fetchLoanTypes = async () => {
    try {
      const result = await loanService.getLoanTypes('advanced');
      console.log('Loan types API response:', result);
      
      if (result.success && Array.isArray(result.loanTypes)) {
        setLoanTypes(result.loanTypes);
        console.log('Loan types data:', result.loanTypes);
        
        // Set interest rate and type from the first loan type (Advanced)
        if (result.loanTypes.length > 0) {
          const advancedLoan = result.loanTypes.find(type => type.name === 'Advanced') || result.loanTypes[0];
          console.log('Selected loan type data:', advancedLoan);
          
          // Use interestAmount and interestType from the API response
          const interestRate = advancedLoan.interestAmount || 1000;
          const interestType = advancedLoan.interestType || 'Flat';
          
          setFormData(prev => ({
            ...prev,
            interestRate: interestRate,
            interestType: interestType
          }));
        }
      } else {
        console.warn('Invalid loan types response:', result);
        setLoanTypes([]);
        // Set default values if no loan types
        setFormData(prev => ({
          ...prev,
          interestRate: 1000,
          interestType: 'Flat'
        }));
      }
    } catch (error) {
      console.error('Failed to fetch loan types:', error);
      setLoanTypes([]);
      // Set default values on error
      setFormData(prev => ({
        ...prev,
        interestRate: 1000,
        interestType: 'Flat'
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // If loan type changes, update interest rate and type
    if (field === 'loanType') {
      const selectedLoanType = loanTypes.find(type => type.name === value);
      console.log('Selected loan type on change:', selectedLoanType);
      
      if (selectedLoanType) {
        // Use interestAmount and interestType from the API response
        const interestRate = selectedLoanType.interestAmount || 1000;
        const interestType = selectedLoanType.interestType || 'Flat';
        
        setFormData(prev => ({
          ...prev,
          interestRate: interestRate,
          interestType: interestType
        }));
      } else {
        // Default values if loan type not found
        setFormData(prev => ({
          ...prev,
          interestRate: 1000,
          interestType: 'Flat'
        }));
      }
    }
  };

  const handleEmployeeChange = (event, newValue) => {
    console.log('Selected employee:', newValue);
    setSelectedEmployee(newValue);
    setFormData(prev => ({
      ...prev,
      userId: newValue?._id || newValue?.id || ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Submitting form data:', formData);
    console.log('Interest Rate:', formData.interestRate, 'Interest Type:', formData.interestType);
    
    if (!formData.userId || !formData.amount || !formData.dueDate) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    setSubmitting(true);
    try {
      const loanData = {
        userId: formData.userId,
        amount: parseFloat(formData.amount),
        loanType: formData.loanType,
        dueDate: formData.dueDate,
        interestRate: formData.interestRate,
        interestType: formData.interestType
      };

      const result = await loanService.createLoan(loanData);
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: result.message || 'Loan request created successfully!',
          severity: 'success'
        });
        
        // Reset form but keep interest values from loan types
        const advancedLoan = loanTypes.find(type => type.name === 'Advanced') || loanTypes[0];
        setFormData({
          userId: '',
          amount: '',
          loanType: 'Advanced',
          dueDate: '',
          interestRate: advancedLoan?.interestAmount || formData.interestRate,
          interestType: advancedLoan?.interestType || formData.interestType
        });
        setSelectedEmployee(null);
        
        // Navigate back after success
        setTimeout(() => {
          navigate('/dashboard/loans');
        }, 2000);
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to create loan request',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error creating loan:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create loan request',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Box>
    
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
    <IconButton 
      onClick={() => navigate('/loans')} 
      sx={{ mr: 2, color: '#42956c' }}
    >
      <ArrowBack />
    </IconButton>
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        New Loan Request
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Create a new loan request for an employee
      </Typography>
    </Box>
  </Box>

  {/* Center form and set width to 30% */}
  <Box sx={{ display: 'flex', justifyContent: 'left' }}>
    <Paper sx={{ p: 4, width: '30%' }}>
      <form onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column" gap={3}>
          <Autocomplete
            options={employees}
            getOptionLabel={(option) =>
              `${option.firstName} ${option.lastName} (${option.email})`
            }
            value={selectedEmployee}
            onChange={handleEmployeeChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Employee *"
                variant="outlined"
                fullWidth
              />
            )}
            isOptionEqualToValue={(option, value) => (option._id || option.id) === (value?._id || value?.id)}
          />

          <TextField
            label="Loan Amount (KES) *"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.amount}
            onChange={(e) => handleInputChange("amount", e.target.value)}
           
          />

          <FormControl fullWidth variant="outlined">
            <InputLabel>Loan Type</InputLabel>
            <Select
              value={formData.loanType}
              onChange={(e) => handleInputChange("loanType", e.target.value)}
              label="Loan Type"
            >
              <MenuItem value="Advanced">Advanced</MenuItem>
              {Array.isArray(loanTypes) &&
                loanTypes.map((type) => (
                  <MenuItem key={type.id} value={type.name}>
                    {type.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            label="Due Date *"
            type="date"
            fullWidth
            variant="outlined"
            value={formData.dueDate}
            onChange={(e) => handleInputChange("dueDate", e.target.value)}
            slotProps={{
              htmlInput: { min: getTomorrowDate() },
              inputLabel: { shrink: true }
            }}
          />


          {/* Action buttons */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/loans")}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={
                submitting ? <CircularProgress size={20} color="inherit" /> : <Save />
              }
              disabled={submitting}
              sx={{
                backgroundColor: "#42956c",
                "&:hover": { backgroundColor: "#357a59" },
              }}
            >
              {submitting ? "Creating..." : "Create Loan Request"}
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  </Box>

  {/* Snackbar for notifications */}
  <Snackbar
    open={snackbar.open}
    autoHideDuration={6000}
    onClose={handleCloseSnackbar}
    anchorOrigin={{ vertical: "top", horizontal: "right" }}
  >
    <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
      {snackbar.message}
    </Alert>
  </Snackbar>
</Box>

  );
};

export default LoanRequest;