import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Button,
  Avatar
} from '@mui/material';
import {
  Search,
  FilterList,
  Download,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';

const Transactions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const transactions = [
    { id: 'TRX001', date: '2024-12-20 09:30', employee: 'John Doe', type: 'salary', amount: 5200, status: 'completed', description: 'Monthly Salary' },
    { id: 'TRX002', date: '2024-12-20 10:15', employee: 'Jane Smith', type: 'loan', amount: -3000, status: 'pending', description: 'Loan Disbursement' },
    { id: 'TRX003', date: '2024-12-19 14:22', employee: 'Mike Johnson', type: 'bonus', amount: 1500, status: 'completed', description: 'Performance Bonus' },
    { id: 'TRX004', date: '2024-12-19 11:45', employee: 'Sarah Williams', type: 'deduction', amount: -450, status: 'completed', description: 'Insurance Deduction' },
    { id: 'TRX005', date: '2024-12-18 16:30', employee: 'Tom Brown', type: 'reimbursement', amount: 320, status: 'processing', description: 'Travel Reimbursement' },
    { id: 'TRX006', date: '2024-12-18 09:00', employee: 'Emily Davis', type: 'salary', amount: 4800, status: 'completed', description: 'Monthly Salary' },
    { id: 'TRX007', date: '2024-12-17 13:15', employee: 'Robert Wilson', type: 'advance', amount: 1000, status: 'completed', description: 'Salary Advance' },
    { id: 'TRX008', date: '2024-12-17 10:30', employee: 'Lisa Anderson', type: 'overtime', amount: 650, status: 'completed', description: 'Overtime Payment' },
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'salary': return '#42956c';
      case 'loan': return '#ff9800';
      case 'bonus': return '#2196f3';
      case 'deduction': return '#f44336';
      case 'reimbursement': return '#9c27b0';
      case 'advance': return '#ff5722';
      case 'overtime': return '#00bcd4';
      default: return '#757575';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Transactions
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View all financial transactions
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Download />}
          sx={{ borderColor: '#42956c', color: '#42956c' }}
        >
          Export
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              displayEmpty
              startAdornment={<FilterList sx={{ mr: 1, fontSize: 20, color: 'action.active' }} />}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="salary">Salary</MenuItem>
              <MenuItem value="loan">Loan</MenuItem>
              <MenuItem value="bonus">Bonus</MenuItem>
              <MenuItem value="deduction">Deduction</MenuItem>
              <MenuItem value="reimbursement">Reimbursement</MenuItem>
              <MenuItem value="advance">Advance</MenuItem>
              <MenuItem value="overtime">Overtime</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              displayEmpty
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {transaction.id}
                    </Typography>
                  </TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: '#42956c' }}>
                        {transaction.employee.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Typography variant="body2">{transaction.employee}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.type}
                      size="small"
                      sx={{
                        backgroundColor: `${getTypeColor(transaction.type)}20`,
                        color: getTypeColor(transaction.type),
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                      {transaction.amount > 0 ? (
                        <ArrowUpward sx={{ fontSize: 16, color: '#42956c' }} />
                      ) : (
                        <ArrowDownward sx={{ fontSize: 16, color: '#f44336' }} />
                      )}
                      <Typography 
                        variant="body2" 
                        fontWeight="bold"
                        sx={{ 
                          color: transaction.amount > 0 ? '#42956c' : '#f44336'
                        }}
                      >
                        ${Math.abs(transaction.amount).toLocaleString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.status}
                      size="small"
                      color={getStatusColor(transaction.status)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Transactions;