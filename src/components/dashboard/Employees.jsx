import { useState, useEffect } from 'react';
import userService from '../../services/userService';
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
  TablePagination,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Tooltip
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Email,
  Phone,
  Download,
  Upload
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';

const Employees = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [addingUser, setAddingUser] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    basicSalary: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchEmployees();
  }, [page, rowsPerPage]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const result = await userService.getUsersList(page, rowsPerPage);
      if (result.success) {
        setEmployees(result.users);
        setTotalEmployees(result.pagination.totalUsers || 0);
        setStats(result.stats || {});
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample employee data (removed - now fetching from API)
  const oldEmployees = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@company.com',
      phone: '+1 234-567-8900',
      department: 'Engineering',
      position: 'Senior Developer',
      salary: 85000,
      status: 'active',
      joinDate: '2020-03-15',
      avatar: null
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      phone: '+1 234-567-8901',
      department: 'Marketing',
      position: 'Marketing Manager',
      salary: 75000,
      status: 'active',
      joinDate: '2019-07-22',
      avatar: null
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      phone: '+1 234-567-8902',
      department: 'Sales',
      position: 'Sales Executive',
      salary: 65000,
      status: 'active',
      joinDate: '2021-01-10',
      avatar: null
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah.williams@company.com',
      phone: '+1 234-567-8903',
      department: 'HR',
      position: 'HR Manager',
      salary: 70000,
      status: 'on-leave',
      joinDate: '2018-11-05',
      avatar: null
    },
    {
      id: 5,
      name: 'Tom Brown',
      email: 'tom.brown@company.com',
      phone: '+1 234-567-8904',
      department: 'Finance',
      position: 'Accountant',
      salary: 60000,
      status: 'active',
      joinDate: '2020-09-18',
      avatar: null
    },
    {
      id: 6,
      name: 'Emily Davis',
      email: 'emily.davis@company.com',
      phone: '+1 234-567-8905',
      department: 'Engineering',
      position: 'Junior Developer',
      salary: 55000,
      status: 'active',
      joinDate: '2022-02-14',
      avatar: null
    },
    {
      id: 7,
      name: 'Robert Wilson',
      email: 'robert.wilson@company.com',
      phone: '+1 234-567-8906',
      department: 'Operations',
      position: 'Operations Manager',
      salary: 72000,
      status: 'inactive',
      joinDate: '2017-06-30',
      avatar: null
    },
    {
      id: 8,
      name: 'Lisa Anderson',
      email: 'lisa.anderson@company.com',
      phone: '+1 234-567-8907',
      department: 'Marketing',
      position: 'Content Writer',
      salary: 48000,
      status: 'active',
      joinDate: '2021-08-20',
      avatar: null
    }
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1); // API uses 1-based pagination
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1); // Reset to first page
  };

  const handleMenuOpen = (event, employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployee(null);
  };

  const handleFilterOpen = (event) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  const handleOpenAddDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewEmployee({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      basicSalary: ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!newEmployee.firstName) errors.firstName = 'First name is required';
    if (!newEmployee.lastName) errors.lastName = 'Last name is required';
    if (!newEmployee.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(newEmployee.email)) errors.email = 'Invalid email';
    if (!newEmployee.phone) errors.phone = 'Phone is required';
    if (!newEmployee.basicSalary) errors.basicSalary = 'Basic salary is required';
    else if (newEmployee.basicSalary < 0) errors.basicSalary = 'Salary must be positive';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddEmployee = async () => {
    if (!validateForm()) return;
    
    setAddingUser(true);
    try {
      // Format phone number if it starts with 07
      let formattedPhone = newEmployee.phone;
      if (formattedPhone.startsWith('07')) {
        formattedPhone = '+254' + formattedPhone.substring(1);
      }
      
      const result = await userService.addUser({
        ...newEmployee,
        phone: formattedPhone,
        basicSalary: parseFloat(newEmployee.basicSalary)
      });
      
      if (result.success) {
        handleCloseDialog();
        fetchEmployees(); // Refresh the list
      } else {
        setFormErrors({ submit: result.message });
      }
    } catch (error) {
      console.error('Failed to add employee:', error);
      setFormErrors({ submit: 'Failed to add employee' });
    } finally {
      setAddingUser(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'on-leave':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    return fullName.includes(searchLower) ||
           (employee.email || '').toLowerCase().includes(searchLower) ||
           (employee.phone || '').toLowerCase().includes(searchLower) ||
           (employee.username || '').toLowerCase().includes(searchLower);
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Employees
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your company employees
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            sx={{ borderColor: '#42956c', color: '#42956c' }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenAddDialog}
            sx={{ backgroundColor: '#42956c', '&:hover': { backgroundColor: '#357a59' } }}
          >
            Add Employee
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flex: 1, maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>User Group</TableCell>
                <TableCell align="right">Basic Salary</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell align="center">Actions</TableCell>
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
                filteredEmployees.map((employee) => (
                  <TableRow key={employee._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#42956c' }}>
                          {employee.firstName && employee.lastName 
                            ? `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase()
                            : employee.username ? employee.username.substring(0, 2).toUpperCase() : 'U'
                          }
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {`${employee.firstName || ''} ${employee.lastName || ''}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{employee.username}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{employee.email}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{employee.phone}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{employee.role || 'N/A'}</TableCell>
                    <TableCell>{employee.userGroup || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={500}>
                        KES {(employee.basicSalary || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={employee.isActive ? 'Active' : 'Inactive'}
                        color={employee.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(employee.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, employee)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalEmployees}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Delete sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: { width: 250, p: 2 }
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Filter Options
        </Typography>
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Department</InputLabel>
          <Select label="Department">
            <MenuItem value="all">All Departments</MenuItem>
            <MenuItem value="engineering">Engineering</MenuItem>
            <MenuItem value="marketing">Marketing</MenuItem>
            <MenuItem value="sales">Sales</MenuItem>
            <MenuItem value="hr">HR</MenuItem>
            <MenuItem value="finance">Finance</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status">
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="on-leave">On Leave</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button size="small" onClick={handleFilterClose}>Cancel</Button>
          <Button size="small" variant="contained" sx={{ backgroundColor: '#42956c' }}>
            Apply
          </Button>
        </Box>
      </Menu>

      {/* Add Employee Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                fullWidth
                size="small"
                value={newEmployee.firstName}
                onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                fullWidth
                size="small"
                value={newEmployee.lastName}
                onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                size="small"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Phone"
                fullWidth
                size="small"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                error={!!formErrors.phone}
                helperText={formErrors.phone || (newEmployee.phone.startsWith('07') ? `Will be saved as +254${newEmployee.phone.substring(1)}` : '')}
                placeholder="0712345678"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Basic Salary (KES)"
                type="number"
                fullWidth
                size="small"
                value={newEmployee.basicSalary}
                onChange={(e) => setNewEmployee({...newEmployee, basicSalary: e.target.value})}
                error={!!formErrors.basicSalary}
                helperText={formErrors.basicSalary}
              />
            </Grid>
            {formErrors.submit && (
              <Grid item xs={12}>
                <Typography color="error" variant="body2">
                  {formErrors.submit}
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={addingUser}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddEmployee}
            disabled={addingUser}
            sx={{ backgroundColor: '#42956c', '&:hover': { backgroundColor: '#357a59' } }}
          >
            {addingUser ? 'Adding...' : 'Add Employee'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Employees;