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
  ListItemSecondaryAction
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

const DashboardHome = () => {
  // Sample data
  const stats = [
    { title: 'Total Employees', value: '248', icon: <People />, color: '#42956c', change: '+12%' },
    { title: 'Total Payroll', value: '$125,430', icon: <AccountBalance />, color: '#2196f3', change: '+8%' },
    { title: 'Active Loans', value: '45', icon: <AttachMoney />, color: '#ff9800', change: '-3%' },
    { title: 'Revenue', value: '$89,200', icon: <TrendingUp />, color: '#9c27b0', change: '+23%' },
  ];

  const payrollData = [
    { month: 'Jan', amount: 85000 },
    { month: 'Feb', amount: 92000 },
    { month: 'Mar', amount: 88000 },
    { month: 'Apr', amount: 95000 },
    { month: 'May', amount: 98000 },
    { month: 'Jun', amount: 105000 },
  ];

  const departmentData = [
    { name: 'Engineering', value: 85, color: '#42956c' },
    { name: 'Sales', value: 65, color: '#2196f3' },
    { name: 'Marketing', value: 45, color: '#ff9800' },
    { name: 'HR', value: 25, color: '#9c27b0' },
    { name: 'Finance', value: 28, color: '#f44336' },
  ];

  const recentTransactions = [
    { id: 1, name: 'John Doe', type: 'Salary', amount: 5200, status: 'completed', time: '2 hours ago' },
    { id: 2, name: 'Jane Smith', type: 'Loan', amount: 3000, status: 'pending', time: '3 hours ago' },
    { id: 3, name: 'Mike Johnson', type: 'Bonus', amount: 1500, status: 'completed', time: '5 hours ago' },
    { id: 4, name: 'Sarah Williams', type: 'Salary', amount: 4800, status: 'completed', time: '1 day ago' },
    { id: 5, name: 'Tom Brown', type: 'Reimbursement', amount: 450, status: 'pending', time: '2 days ago' },
  ];

  const upcomingPayroll = [
    { department: 'Engineering', date: 'Dec 25, 2024', amount: 45000, employees: 30 },
    { department: 'Sales', date: 'Dec 25, 2024', amount: 32000, employees: 20 },
    { department: 'Marketing', date: 'Dec 25, 2024', amount: 18000, employees: 12 },
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
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: `${stat.color}20`, color: stat.color, mr: 2 }}>
                    {stat.icon}
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {stat.change.startsWith('+') ? (
                    <ArrowUpward sx={{ fontSize: 16, color: '#42956c' }} />
                  ) : (
                    <ArrowDownward sx={{ fontSize: 16, color: '#f44336' }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{ 
                      color: stat.change.startsWith('+') ? '#42956c' : '#f44336',
                      fontWeight: 600
                    }}
                  >
                    {stat.change}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Payroll Trends
              </Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={payrollData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#42956c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Employees by Department
              </Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              {departmentData.map((dept, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: dept.color,
                      mr: 1
                    }}
                  />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {dept.name}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {dept.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Transactions and Upcoming Payroll */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Recent Transactions
              </Typography>
              <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                View All
              </Typography>
            </Box>
            <List>
              {recentTransactions.map((transaction) => (
                <ListItem key={transaction.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#42956c' }}>
                      {transaction.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={transaction.name}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption">{transaction.type}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          • {transaction.time}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="bold">
                        ${transaction.amount.toLocaleString()}
                      </Typography>
                      <Chip
                        label={transaction.status}
                        size="small"
                        sx={{
                          mt: 0.5,
                          backgroundColor: transaction.status === 'completed' ? '#e8f5e9' : '#fff3e0',
                          color: transaction.status === 'completed' ? '#42956c' : '#ff9800',
                          fontSize: '0.75rem'
                        }}
                      />
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Upcoming Payroll
              </Typography>
              <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                Schedule All
              </Typography>
            </Box>
            {upcomingPayroll.map((payroll, index) => (
              <Card key={index} sx={{ mb: 2, bgcolor: '#f5f5f5' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1" fontWeight="bold">
                      {payroll.department}
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      ${payroll.amount.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {payroll.date}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <People sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {payroll.employees} employees
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={75} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#42956c',
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    75% prepared
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;