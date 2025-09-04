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
  Avatar,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  Schedule,
  Warning,
  MoreVert,
  Add,
  CheckCircle,
  Cancel
} from '@mui/icons-material';

const Loans = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const loanStats = [
    { label: 'Total Loans', value: '$458,320', icon: <AttachMoney />, color: '#42956c' },
    { label: 'Active Loans', value: '45', icon: <TrendingUp />, color: '#2196f3' },
    { label: 'Pending Approval', value: '12', icon: <Schedule />, color: '#ff9800' },
    { label: 'Defaulted', value: '3', icon: <Warning />, color: '#f44336' },
  ];

  const loans = [
    { id: 1, employee: 'John Doe', amount: 15000, purpose: 'Home Renovation', rate: '5%', term: '12 months', status: 'active', paid: 45 },
    { id: 2, employee: 'Jane Smith', amount: 8000, purpose: 'Medical Emergency', rate: '4%', term: '6 months', status: 'active', paid: 67 },
    { id: 3, employee: 'Mike Johnson', amount: 25000, purpose: 'Education', rate: '3%', term: '24 months', status: 'pending', paid: 0 },
    { id: 4, employee: 'Sarah Williams', amount: 5000, purpose: 'Personal', rate: '6%', term: '3 months', status: 'completed', paid: 100 },
    { id: 5, employee: 'Tom Brown', amount: 12000, purpose: 'Car Purchase', rate: '5%', term: '18 months', status: 'active', paid: 30 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'primary';
      case 'pending': return 'warning';
      case 'completed': return 'success';
      case 'defaulted': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Loan Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage employee loans
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ backgroundColor: '#42956c', '&:hover': { backgroundColor: '#357a59' } }}
        >
          New Loan Request
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {loanStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      {stat.label}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ mt: 1, color: stat.color }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color, opacity: 0.3, fontSize: 40 }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
          Loan Applications
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Interest Rate</TableCell>
                <TableCell>Term</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: '#42956c', width: 32, height: 32, fontSize: 14 }}>
                        {loan.employee.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Typography variant="body2">{loan.employee}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      ${loan.amount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>{loan.purpose}</TableCell>
                  <TableCell>{loan.rate}</TableCell>
                  <TableCell>{loan.term}</TableCell>
                  <TableCell>
                    <Chip
                      label={loan.status}
                      size="small"
                      color={getStatusColor(loan.status)}
                    />
                  </TableCell>
                  <TableCell sx={{ width: 150 }}>
                    <Box>
                      <LinearProgress
                        variant="determinate"
                        value={loan.paid}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: loan.paid === 100 ? '#42956c' : '#2196f3',
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {loan.paid}% paid
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    {loan.status === 'pending' ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" color="success">
                          <CheckCircle />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Cancel />
                        </IconButton>
                      </Box>
                    ) : (
                      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                        <MoreVert />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem>View Details</MenuItem>
        <MenuItem>Edit Terms</MenuItem>
        <MenuItem>Payment History</MenuItem>
      </Menu>
    </Box>
  );
};

export default Loans;