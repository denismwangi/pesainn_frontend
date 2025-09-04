import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
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
  InputAdornment
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  Schedule,
  People,
  Search,
  Download,
  PlayArrow
} from '@mui/icons-material';

const Payroll = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const payrollSummary = [
    { label: 'Total Payroll This Month', value: '$125,430', change: '+8%', icon: <AccountBalance /> },
    { label: 'Employees Paid', value: '215/248', change: '87%', icon: <People /> },
    { label: 'Average Salary', value: '$5,834', change: '+2%', icon: <TrendingUp /> },
    { label: 'Next Payroll', value: 'Dec 25', change: '5 days', icon: <Schedule /> },
  ];

  const payrollHistory = [
    { id: 1, month: 'November 2024', amount: 125430, employees: 248, status: 'completed', date: '2024-11-25' },
    { id: 2, month: 'October 2024', amount: 118920, employees: 245, status: 'completed', date: '2024-10-25' },
    { id: 3, month: 'September 2024', amount: 115200, employees: 242, status: 'completed', date: '2024-09-25' },
    { id: 4, month: 'August 2024', amount: 112500, employees: 240, status: 'completed', date: '2024-08-25' },
  ];

  const upcomingPayroll = [
    { id: 1, name: 'John Doe', department: 'Engineering', salary: 7500, tax: 1500, net: 6000, status: 'pending' },
    { id: 2, name: 'Jane Smith', department: 'Marketing', salary: 6800, tax: 1360, net: 5440, status: 'pending' },
    { id: 3, name: 'Mike Johnson', department: 'Sales', salary: 5500, tax: 1100, net: 4400, status: 'approved' },
    { id: 4, name: 'Sarah Williams', department: 'HR', salary: 6200, tax: 1240, net: 4960, status: 'approved' },
    { id: 5, name: 'Tom Brown', department: 'Finance', salary: 5000, tax: 1000, net: 4000, status: 'pending' },
  ];

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
            variant="outlined"
            startIcon={<Download />}
            sx={{ borderColor: '#42956c', color: '#42956c' }}
          >
            Export Report
          </Button>
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
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {payrollSummary.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      {item.label}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                      {item.value}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: '#42956c' }}>
                      {item.change}
                    </Typography>
                  </Box>
                  <Box sx={{ color: '#42956c', opacity: 0.3 }}>
                    {item.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ px: 3 }}>
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Typography variant="h6">
              Total: <strong>$28,900</strong>
            </Typography>
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
                </TableRow>
              </TableHead>
              <TableBody>
                {upcomingPayroll.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell align="right">${row.salary.toLocaleString()}</TableCell>
                    <TableCell align="right">${row.tax.toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <strong>${row.net.toLocaleString()}</strong>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={row.status === 'approved' ? 'success' : 'warning'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
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
    </Box>
  );
};

export default Payroll;