import { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { API_ENDPOINTS } from '../../config/api';
import { TokenManager } from '../../utils/storage';
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
  TablePagination,
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [runPayrollDialog, setRunPayrollDialog] = useState(false);
  const [runningPayroll, setRunningPayroll] = useState(false);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchEmployeeStatistics();
  }, []);

  useEffect(() => {
    if (tabValue === 1) { // Only fetch when Payroll History tab is active
      fetchPayrollHistory();
    }
  }, [tabValue]);

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

  const fetchPayrollHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = TokenManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_ENDPOINTS.PAYROLL_HISTORY, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPayrollHistory(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch payroll history');
      }
    } catch (error) {
      console.error('Error fetching payroll history:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to fetch payroll history',
        severity: 'error'
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  const upcomingPayroll = employees.map(employee => ({
    id: employee.id,
    name: `${employee.firstName} ${employee.lastName}`,
    department: employee.userGroup || 'Employee',
    salary: employee.basicSalary || 0,
    tax: 0, // Tax is always 0
    net: employee.basicSalary || 0, // Net salary equals gross salary since tax is 0
    status: employee.basicSalary > 0 ? 'approved' : 'pending',
    email: employee.email,
    joinedAt: employee.joinedAt
  }));

  const filteredEmployees = upcomingPayroll.filter(employee => 
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  const handleRunPayroll = async () => {
    setRunningPayroll(true);
    try {
      const token = TokenManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const currentDate = new Date();
      const monthYear = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
      const reference = `SALARY-${monthYear}`;

      const response = await fetch(API_ENDPOINTS.BULK_CREDIT_SALARY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description: 'Monthly salary payment',
          reference: reference,
          category: 'salary'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSnackbar({
          open: true,
          message: data.message || 'Payroll processed successfully!',
          severity: 'success'
        });
        setRunPayrollDialog(false);
        // Refresh employee data to show updated balances
        await fetchEmployeeStatistics();
      } else {
        throw new Error(data.message || 'Failed to run payroll');
      }
    } catch (error) {
      console.error('Error running payroll:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to run payroll. Please try again.',
        severity: 'error'
      });
    } finally {
      setRunningPayroll(false);
    }
  };

  const handleOpenRunPayrollDialog = () => {
    setRunPayrollDialog(true);
  };

  const handleCloseRunPayrollDialog = () => {
    setRunPayrollDialog(false);
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
            onClick={handleOpenRunPayrollDialog}
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
                  paginatedEmployees.map((row) => (
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
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredEmployees.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ borderTop: 1, borderColor: 'divider' }}
          />
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Period</TableCell>
                  <TableCell>Date Processed</TableCell>
                  <TableCell>Employees</TableCell>
                  <TableCell align="">Total Amount</TableCell>
                  
                 
                </TableRow>
              </TableHead>
              <TableBody>
                {historyLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : payrollHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <Typography variant="body1" color="text.secondary">
                        No payroll history found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  payrollHistory.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.monthName}</TableCell>
                      <TableCell>{row.dateCreated ? new Date(row.dateCreated).toLocaleDateString('en-KE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : '-'}</TableCell>
                       <TableCell>{row.totalEmployees || row.totalEmployees}</TableCell>

                      <TableCell>
                        <strong>{formatCurrency(row.totalAmount || row.amount)}</strong>
                      </TableCell>

                      
                    </TableRow>
                  ))
                )}
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

      {/* Run Payroll Confirmation Dialog */}
      <Dialog open={runPayrollDialog} onClose={handleCloseRunPayrollDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Confirm Payroll Processing
            <IconButton onClick={handleCloseRunPayrollDialog} size="small" disabled={runningPayroll}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to process payroll for all employees?
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Payroll Summary:
            </Typography>
            <Typography variant="body2">
              <strong>Total Employees:</strong> {statistics.totalEmployees || 0}
            </Typography>
            <Typography variant="body2">
              <strong>Total Amount:</strong> {formatCurrency(statistics.totalBasicSalary || 0)}
            </Typography>
            <Typography variant="body2">
              <strong>Processing Date:</strong> {new Date().toLocaleDateString('en-KE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
            <Typography variant="body2">
              <strong>Reference:</strong> SALARY-{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
            </Typography>
          </Box>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action will credit salaries to all active employees' wallets and cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseRunPayrollDialog} color="inherit" disabled={runningPayroll}>
            Cancel
          </Button>
          <Button 
            onClick={handleRunPayroll}
            variant="contained"
            disabled={runningPayroll}
            sx={{ 
              backgroundColor: '#42956c', 
              '&:hover': { backgroundColor: '#357a59' } 
            }}
          >
            {runningPayroll ? <CircularProgress size={20} color="inherit" /> : 'Process Payroll'}
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