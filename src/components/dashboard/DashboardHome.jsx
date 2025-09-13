import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  IconButton,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  People,
  AttachMoney,
  TrendingUp,
  AccountBalance,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  Schedule,
  CheckCircle
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { API_ENDPOINTS } from '../../config/api';
import { TokenManager } from '../../utils/storage';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payrollLoading, setPayrollLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalEmployees: 0,
    totalPayrollAmount: 0,
    activeLoanAmount: 0,
    totalInterest: 0
  });
  const [salaryStatistics, setSalaryStatistics] = useState([]);
  const [revenueStatistics, setRevenueStatistics] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchDashboardStatistics();
    fetchSalaryStatistics();
    fetchRevenueStatistics();
    fetchRecentTransactions();
  }, []);

  const fetchDashboardStatistics = async () => {
    setLoading(true);
    try {
      const token = TokenManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_ENDPOINTS.DASHBOARD_STATISTICS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatistics({
          totalEmployees: data.data.totalEmployees || 0,
          totalPayrollAmount: data.data.totalPayrollAmount || 0,
          activeLoanAmount: data.data.activeLoanAmount || 0,
          totalInterest: data.data.totalInterest || 0
        });
      } else {
        console.error('Failed to fetch dashboard statistics:', data.message);
      }
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaryStatistics = async () => {
    setPayrollLoading(true);
    try {
      const token = TokenManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_ENDPOINTS.SALARY_STATISTICS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Transform the data for the chart
        const chartData = data.data.monthlyStatistics.map(stat => ({
          month: stat.monthName.substring(0, 3), // Get first 3 letters (Jan, Feb, etc.)
          amount: stat.totalAmount,
          transactionCount: stat.transactionCount,
          avgAmount: stat.avgAmount
        }));
        
        // Sort by year and month to ensure proper order
        chartData.sort((a, b) => {
          const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
        });

        setSalaryStatistics(chartData);
      } else {
        console.error('Failed to fetch salary statistics:', data.message);
      }
    } catch (error) {
      console.error('Error fetching salary statistics:', error);
    } finally {
      setPayrollLoading(false);
    }
  };

  const fetchRevenueStatistics = async () => {
    setRevenueLoading(true);
    try {
      const token = TokenManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_ENDPOINTS.REVENUE_STATISTICS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Revenue statistics received:', data.data);
        
        // Transform the data for the pie chart
        const chartData = [
          { 
            name: 'Total Paid Payroll', 
            value: data.data.totalPaidPayroll || 0, 
            color: '#42956c' 
          },
          { 
            name: 'Total Loans', 
            value: data.data.totalLoans || 0, 
            color: '#2196f3' 
          },
          { 
            name: 'Total Interest', 
            value: data.data.totalInterest || 0, 
            color: '#ff9800' 
          }
        ].filter(item => item.value > 0); // Filter out zero values

        console.log('Chart data:', chartData);
        setRevenueStatistics(chartData);
      } else {
        console.error('Failed to fetch revenue statistics:', data.message);
      }
    } catch (error) {
      console.error('Error fetching revenue statistics:', error);
    } finally {
      setRevenueLoading(false);
    }
  };

  const fetchRecentTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const token = TokenManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_ENDPOINTS.RECENT_TRANSACTIONS}?page=1&limit=5`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Recent transactions received:', data.data);
        setRecentTransactions(data.data.transactions || []);
      } else {
        console.error('Failed to fetch recent transactions:', data.message);
      }
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return { bg: '#e8f5e9', color: '#42956c' };
      case 'pending': return { bg: '#fff3e0', color: '#ff9800' };
      case 'failed': return { bg: '#ffebee', color: '#f44336' };
      case 'processing': return { bg: '#e3f2fd', color: '#2196f3' };
      default: return { bg: '#f5f5f5', color: '#757575' };
    }
  };

  const stats = [
    { 
      title: 'Total Employees', 
      value: loading ? '...' : statistics.totalEmployees.toString(), 
      icon: <People />, 
      color: '#42956c',  
    },
    { 
      title: 'Total Payroll', 
      value: loading ? '...' : formatCurrency(statistics.totalPayrollAmount), 
      icon: <AccountBalance />, 
      color: '#2196f3', 
       
    },
    { 
      title: 'Active Loans', 
      value: loading ? '...' : formatCurrency(statistics.activeLoanAmount), 
      icon: <AttachMoney />, 
      color: '#ff9800', 
       
    },
    { 
      title: 'Total Interest', 
      value: loading ? '...' : formatCurrency(statistics.totalInterest), 
      icon: <TrendingUp />, 
      color: '#9c27b0', 
      
    },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard Overview
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Welcome back! Here's what's happening with your business today.
      </Typography>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, width: '100%' }}>
        {stats.map((stat, index) => (
          <Card key={index} sx={{ flex: 1, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: `${stat.color}20`, color: stat.color, mr: 2 }}>
                  {loading ? <CircularProgress size={20} sx={{ color: stat.color }} /> : stat.icon}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography color="text.secondary" variant="body2">
                    {stat.title}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {stat.value}
                  </Typography>
                </Box>
              </Box>
             
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Charts Row */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, width: '100%' }}>
        <Paper sx={{ p: 3, flex: '0 0 70%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Payroll Trends
            </Typography>
            <IconButton size="small">
              <MoreVert />
            </IconButton>
          </Box>
          <ResponsiveContainer width="100%" height={300}>
            {payrollLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <BarChart data={salaryStatistics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'amount') {
                      return [formatCurrency(value), 'Total Amount'];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar dataKey="amount" fill="#42956c" radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </Paper>

        <Paper sx={{ p: 3, flex: '0 0 30%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Revenue Statistics
            </Typography>
            <IconButton size="small">
              <MoreVert />
            </IconButton>
          </Box>
          <ResponsiveContainer width="100%" height={250}>
            {revenueLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <PieChart>
                <Pie
                  data={revenueStatistics}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  minAngle={15}
                >
                  {revenueStatistics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [formatCurrency(value), name]}
                />
              </PieChart>
            )}
          </ResponsiveContainer>
          <Box sx={{ mt: 2 }}>
            {revenueStatistics.map((stat, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: stat.color,
                    mr: 1
                  }}
                />
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {stat.name}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatCurrency(stat.value)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      {/* Recent Transactions */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Recent Transactions
          </Typography>
          <Typography 
            variant="body2" 
            color="primary" 
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/dashboard/transactions')}
          >
            View All
          </Typography>
        </Box>
        {transactionsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date & Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      <Typography variant="body2" color="text.secondary">
                        No recent transactions found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  recentTransactions.map((transaction) => {
                    const statusColors = getStatusColor(transaction.status);
                    return (
                      <TableRow key={transaction._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#42956c', width: 32, height: 32 }}>
                              {transaction.firstName && transaction.lastName 
                                ? `${transaction.firstName[0]}${transaction.lastName[0]}`.toUpperCase()
                                : 'U'
                              }
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="500">
                                {`${transaction.firstName || ''} ${transaction.lastName || ''}`.trim() || 'Unknown User'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {transaction.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {transaction.phone || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {transaction.transactionId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {transaction.reference}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {transaction.category}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(transaction.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.status.toUpperCase()}
                            size="small"
                            sx={{
                              backgroundColor: statusColors.bg,
                              color: statusColors.color,
                              fontSize: '0.65rem',
                              fontWeight: 'bold',
                              height: 24
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(transaction.createdAt).toLocaleDateString('en-KE', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(transaction.createdAt).toLocaleTimeString('en-KE', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default DashboardHome;