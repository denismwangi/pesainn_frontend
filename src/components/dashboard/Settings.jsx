import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import {
  Save,
  Person,
  Business,
  Notifications,
  Security,
  Payment,
  Edit,
  Delete
} from '@mui/icons-material';

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [saved, setSaved] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@company.com',
    phone: '+1 234-567-8900',
    role: 'Administrator'
  });

  const [companyData, setCompanyData] = useState({
    name: 'PESAIN Inc.',
    address: '123 Business St, City, State 12345',
    phone: '+1 234-567-8900',
    email: 'contact@pesain.com',
    taxId: '12-3456789',
    currency: 'USD'
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    payrollReminders: true,
    loanUpdates: true,
    systemAlerts: true,
    monthlyReports: true
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabPanels = [
    { label: 'Profile', icon: <Person /> },
    { label: 'Company', icon: <Business /> },
    { label: 'Notifications', icon: <Notifications /> },
    { label: 'Security', icon: <Security /> },
    { label: 'Payment', icon: <Payment /> }
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your application preferences
        </Typography>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Paper>
        <Tabs 
          value={tabValue} 
          onChange={(e, v) => setTabValue(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
        >
          {tabPanels.map((panel, index) => (
            <Tab 
              key={index}
              label={panel.label} 
              icon={panel.icon} 
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Profile Settings */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Role"
                  value={profileData.role}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  sx={{ backgroundColor: '#42956c', '&:hover': { backgroundColor: '#357a59' } }}
                >
                  Save Profile
                </Button>
              </Grid>
            </Grid>
          )}

          {/* Company Settings */}
          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={2}
                  value={companyData.address}
                  onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={companyData.email}
                  onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tax ID"
                  value={companyData.taxId}
                  onChange={(e) => setCompanyData({...companyData, taxId: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={companyData.currency}
                    label="Currency"
                    onChange={(e) => setCompanyData({...companyData, currency: e.target.value})}
                  >
                    <MenuItem value="USD">USD - US Dollar</MenuItem>
                    <MenuItem value="EUR">EUR - Euro</MenuItem>
                    <MenuItem value="GBP">GBP - British Pound</MenuItem>
                    <MenuItem value="JPY">JPY - Japanese Yen</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  sx={{ backgroundColor: '#42956c', '&:hover': { backgroundColor: '#357a59' } }}
                >
                  Save Company Settings
                </Button>
              </Grid>
            </Grid>
          )}

          {/* Notification Settings */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Notification Preferences
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.emailNotifications}
                        onChange={(e) => setNotifications({...notifications, emailNotifications: e.target.checked})}
                        color="primary"
                      />
                    }
                    label="Email Notifications"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.smsNotifications}
                        onChange={(e) => setNotifications({...notifications, smsNotifications: e.target.checked})}
                        color="primary"
                      />
                    }
                    label="SMS Notifications"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Notification Types
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.payrollReminders}
                        onChange={(e) => setNotifications({...notifications, payrollReminders: e.target.checked})}
                        color="primary"
                      />
                    }
                    label="Payroll Reminders"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.loanUpdates}
                        onChange={(e) => setNotifications({...notifications, loanUpdates: e.target.checked})}
                        color="primary"
                      />
                    }
                    label="Loan Updates"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.systemAlerts}
                        onChange={(e) => setNotifications({...notifications, systemAlerts: e.target.checked})}
                        color="primary"
                      />
                    }
                    label="System Alerts"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.monthlyReports}
                        onChange={(e) => setNotifications({...notifications, monthlyReports: e.target.checked})}
                        color="primary"
                      />
                    }
                    label="Monthly Reports"
                  />
                </Grid>
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    sx={{ backgroundColor: '#42956c', '&:hover': { backgroundColor: '#357a59' } }}
                  >
                    Save Notification Settings
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Security Settings */}
          {tabValue === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Security Settings
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type="password"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type="password"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch defaultChecked color="primary" />}
                    label="Two-Factor Authentication"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch defaultChecked color="primary" />}
                    label="Require password change every 90 days"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    sx={{ backgroundColor: '#42956c', '&:hover': { backgroundColor: '#357a59' } }}
                  >
                    Update Security Settings
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Payment Settings */}
          {tabValue === 4 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Payment Methods
              </Typography>
              <List>
                <ListItem divider>
                  <ListItemText
                    primary="Bank Account - **** 1234"
                    secondary="Primary payment method"
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" size="small">
                      <Edit />
                    </IconButton>
                    <IconButton edge="end" size="small">
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem divider>
                  <ListItemText
                    primary="Credit Card - **** 5678"
                    secondary="Backup payment method"
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" size="small">
                      <Edit />
                    </IconButton>
                    <IconButton edge="end" size="small">
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  sx={{ borderColor: '#42956c', color: '#42956c' }}
                >
                  Add Payment Method
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings;