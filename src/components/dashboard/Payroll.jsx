import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
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
  LinearProgress,
  Tab,
  Tabs,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  Schedule,
  People,
  Search,
  PlayArrow,
  Edit,
  Close
} from '@mui/icons-material';

const Payroll = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({});
  const [employees, setEmployees] = useState([]);
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newSalary, setNewSalary] = useState('');
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchEmployeeStatistics();
  }, []);

  const fetchEmployeeStatistics = async () => {
    setLoading(true);
    try {
      const result = await userService.getEmployeeStatistics(1, 10);
      if (result.success) {
        setStatistics(result.statistics || {});
        setEmployees(result.users || []);
      } else {
        console.warn('Failed to fetch employee statistics:', result.message);
        setStatistics({});
        setEmployees([]);
      }
    } catch (error) {
      console.error('Failed to fetch employee statistics:', error);
      setStatistics({});
      setEmployees([]);
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
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getNextPayrollDate = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 5);
    return nextMonth.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilPayroll = () => {
    const today = new Date();
    const nextPayroll = new Date(today.getFullYear(), today.getMonth() + 1, 5);
    const diffTime = nextPayroll - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  const payrollSummary = [
    { 
      label: 'Total Basic Salary', 
      value: loading ? '...' : formatCurrency(statistics.totalBasicSalary || 0), 
      change: '+8%', 
      icon: <AccountBalance /> 
    },
    { 
      label: 'Total Employees', 
      value: loading ? '...' : `${statistics.totalEmployees || 0}`, 
      change: '100%', 
      icon: <People /> 
    },
    { 
      label: 'Total Loans', 
      value: loading ? '...' : formatCurrency(statistics.totalLoans || 0), 
      change: '+2%', 
      icon: <TrendingUp /> 
    },
    { 
      label: 'Next Payroll', 
      value: getNextPayrollDate(), 
      change: getDaysUntilPayroll(), 
      icon: <Schedule /> 
    },
  ];

  const payrollHistory = [
    { id: 1, month: 'November 2024', amount: 125430, employees: 248, status: 'completed', date: '2024-11-25' },
    { id: 2, month: 'October 2024', amount: 118920, employees: 245, status: 'completed', date: '2024-10-25' },
    { id: 3, month: 'September 2024', amount: 115200, employees: 242, status: 'completed', date: '2024-09-25' },
    { id: 4, month: 'August 2024', amount: 112500, employees: 240, status: 'completed', date: '2024-08-25' },
  ];

  const calculateTax = (salary) => {
    // Simple tax calculation - 20% of salary
    return salary * 0.2;
  };

  const upcomingPayroll = employees.map(employee => ({
    id: employee.id,
    name: `${employee.firstName} ${employee.lastName}`,
    department: employee.userGroup || 'Employee',
    salary: employee.basicSalary || 0,
    tax: calculateTax(employee.basicSalary || 0),
    net: (employee.basicSalary || 0) - calculateTax(employee.basicSalary || 0),
    status: employee.basicSalary > 0 ? 'approved' : 'pending',
    email: employee.email,
    joinedAt: employee.joinedAt
  }));

  const filteredEmployees = upcomingPayroll.filter(employee => 
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEmployeeClick = (employeeId) => {
    navigate(`/employees/${employeeId}`);
  };

  const handleUpdateSalary = (employee) => {
    setSelectedEmployee(employee);
    setNewSalary(employee.salary.toString());
    setSalaryModalOpen(true);
  };

  const handleSalaryUpdate = async () => {
    if (!selectedEmployee || !newSalary) return;

    setUpdating(true);
    try {
      const result = await userService.updateEmployeeSalary(selectedEmployee.id, parseFloat(newSalary));
      if (result.success) {
        setSnackbar({
          open: true,
          message: result.message || 'Salary updated successfully!',
          severity: 'success'
        });
        setSalaryModalOpen(false);
        setNewSalary('');
        setSelectedEmployee(null);
        // Refresh employee data
        await fetchEmployeeStatistics();
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update salary',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating salary:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update salary',
        severity: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseSalaryModal = () => {
    setSalaryModalOpen(false);
    setNewSalary('');
    setSelectedEmployee(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Payroll Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Process and manage employee payments
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            sx={{ backgroundColor: '#42956c', '&:hover': { backgroundColor: '#357a59' } }}
          >
            Run Payroll
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ width: '100%', mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {payrollSummary.map((item, index) => (
              <Card key={index} sx={{ height: '100%', width: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      {item.label}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                      {item.value}
                    </Typography>
  
                  </Box>
                  <Box sx={{ color: '#42956c', opacity: 0.3 }}>
                    {item.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
       
        ))}
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ px: 3 }}>
          <Tab label="Upcoming Payroll" />
          <Tab label="Payroll History" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
            <TextField
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ width: 300 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }
              }}
            />
           
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell align="right">Gross Salary</TableCell>
                  <TableCell align="right">Tax</TableCell>
                  <TableCell align="right">Net Salary</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <Typography variant="body1" color="text.secondary">
                        No employees found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((row) => (
                    <TableRow 
                      key={row.id} 
                      hover
                    >
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.department}</TableCell>
                      <TableCell align="right">{formatCurrency(row.salary)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.tax)}</TableCell>
                      <TableCell align="right">
                        <strong>{formatCurrency(row.net)}</strong>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          color={row.status === 'approved' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => handleUpdateSalary(row)}
                          sx={{ 
                            borderColor: '#42956c', 
                            color: '#42956c',
                            '&:hover': { 
                              backgroundColor: '#42956c10',
                              borderColor: '#42956c'
                            }
                          }}
                        >
                          Update Salary
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Period</TableCell>
                  <TableCell>Date Processed</TableCell>
                  <TableCell align="right">Total Amount</TableCell>
                  <TableCell>Employees</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payrollHistory.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.month}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell align="right">
                      <strong>${row.amount.toLocaleString()}</strong>
                    </TableCell>
                    <TableCell>{row.employees}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color="success"
                      />
                    </TableCell>
                    <TableCell sx={{ width: 200 }}>
                      <LinearProgress
                        variant="determinate"
                        value={100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#42956c',
                          }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Update Salary Modal */}
      <Dialog open={salaryModalOpen} onClose={handleCloseSalaryModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Update Salary - {selectedEmployee?.name}
            <IconButton onClick={handleCloseSalaryModal} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Salary (KES)"
            type="number"
            fullWidth
            variant="outlined"
            value={newSalary}
            onChange={(e) => setNewSalary(e.target.value)}
            sx={{ mt: 2 }}
            slotProps={{
              htmlInput: { min: 0, step: 1000 }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseSalaryModal} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSalaryUpdate} 
            variant="contained"
            disabled={updating || !newSalary}
            sx={{ 
              backgroundColor: '#42956c', 
              '&:hover': { backgroundColor: '#357a59' } 
            }}
          >
            {updating ? <CircularProgress size={20} color="inherit" /> : 'Update Salary'}
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Payroll;