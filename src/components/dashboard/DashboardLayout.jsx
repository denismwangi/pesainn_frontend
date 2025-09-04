import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import userService from '../../services/userService';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  People,
  AccountBalance,
  AttachMoney,
  Receipt,
  Settings,
  Dashboard,
  Logout,
  Notifications,
  AccountCircle,
  ChevronLeft,
  Refresh,
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';

const drawerWidth = 280;
const collapsedWidth = 65;

const DashboardLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(!isTablet);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    // Get current user data from session
    const sessionData = authService.getCurrentUser();
    if (sessionData && sessionData.user) {
      setCurrentUser(sessionData.user);
      // Fetch fresh profile data from API
      fetchUserProfile();
    } else {
      // If no user data, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const result = await userService.getUserProfile();
      
      if (result.success && result.user) {
        setCurrentUser(result.user);
      } else if (!result.success && result.message.includes('authentication')) {
        // Token might be expired, redirect to login
        authService.logout();
        navigate('/login');
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Employees', icon: <People />, path: '/dashboard/employees' },
    { text: 'Payroll', icon: <AccountBalance />, path: '/dashboard/payroll' },
    { text: 'Loans', icon: <AttachMoney />, path: '/dashboard/loans' },
    { text: 'Transactions', icon: <Receipt />, path: '/dashboard/transactions' },
    { text: 'Settings', icon: <Settings />, path: '/dashboard/settings' },
  ];

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDrawerOpen(!drawerOpen);
    }
  };

  const handleMenuClick = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, navigate to login
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitials = () => {
    if (currentUser) {
      if (currentUser.fullName) {
        return currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
      } else if (currentUser.firstName && currentUser.lastName) {
        return (currentUser.firstName[0] + currentUser.lastName[0]).toUpperCase();
      } else if (currentUser.username) {
        return currentUser.username.substring(0, 2).toUpperCase();
      }
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (currentUser) {
      return currentUser.fullName || `${currentUser.firstName} ${currentUser.lastName}` || currentUser.username || 'User';
    }
    return 'User';
  };

  const getUserRole = () => {
    if (currentUser) {
      return currentUser.role || currentUser.userGroup || 'User';
    }
    return 'User';
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: drawerOpen || mobileOpen ? 'space-between' : 'center',
          px: drawerOpen || mobileOpen ? 3 : 1,
          py: 2,
        }}
      >
        {(drawerOpen || mobileOpen) && (
          <Typography 
            variant="h5" 
            noWrap 
            sx={{ 
              fontWeight: 'bold',
              color: '#42956c',
              letterSpacing: '-0.5px'
            }}
          >
            PESAIN
          </Typography>
        )}
        {!isMobile && (
          <IconButton
            onClick={handleDrawerToggle}
            size="small"
            sx={{ 
              ml: drawerOpen ? 0 : 0,
              color: 'text.secondary'
            }}
          >
            {drawerOpen ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleMenuClick(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 0.5,
                  backgroundColor: isActive ? 'rgba(66, 149, 108, 0.08)' : 'transparent',
                  color: isActive ? '#42956c' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive 
                      ? 'rgba(66, 149, 108, 0.12)' 
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                  minHeight: 48,
                  justifyContent: (drawerOpen || mobileOpen) ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <Tooltip 
                  title={!drawerOpen && !isMobile ? item.text : ''} 
                  placement="right"
                  arrow
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: (drawerOpen || mobileOpen) ? 3 : 'auto',
                      justifyContent: 'center',
                      color: isActive ? '#42956c' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                </Tooltip>
                {(drawerOpen || mobileOpen) && (
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 400,
                      fontSize: '0.95rem',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Divider />
      <Box sx={{ p: 2 }}>
        {(drawerOpen || mobileOpen) ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#42956c', width: 40, height: 40 }}>
              {isLoadingProfile ? (
                <CircularProgress size={20} sx={{ color: 'white' }} />
              ) : (
                getUserInitials()
              )}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {getUserDisplayName()}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {getUserRole()}
              </Typography>
            </Box>
            <Tooltip title="Refresh Profile">
              <IconButton 
                size="small" 
                onClick={fetchUserProfile}
                disabled={isLoadingProfile}
                sx={{ color: 'text.secondary' }}
              >
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar sx={{ bgcolor: '#42956c', width: 35, height: 35 }}>
              {isLoadingProfile ? (
                <CircularProgress size={16} sx={{ color: 'white' }} />
              ) : (
                getUserInitials()
              )}
            </Avatar>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f6fa' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : collapsedWidth}px)` },
          ml: { sm: `${drawerOpen ? drawerWidth : collapsedWidth}px` },
          backgroundColor: '#ffffff',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton
                size="large"
                color="inherit"
                onClick={handleNotificationOpen}
              >
                <Badge badgeContent={4} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Profile">
              <IconButton
                size="large"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
            </Tooltip>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {getUserDisplayName()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentUser?.email || 'No email'}
              </Typography>
            </Box>
            <MenuItem onClick={() => { handleProfileMenuClose(); fetchUserProfile(); }}>
              <ListItemIcon>
                <Refresh fontSize="small" />
              </ListItemIcon>
              Refresh Profile
            </MenuItem>
            <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/dashboard/profile'); }}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/dashboard/settings'); }}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { handleProfileMenuClose(); handleLogout(); }} disabled={isLoggingOut}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </MenuItem>
          </Menu>

          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleNotificationClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: { width: 320, maxHeight: 400 }
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Notifications</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleNotificationClose}>
              <Typography variant="body2">New employee added</Typography>
            </MenuItem>
            <MenuItem onClick={handleNotificationClose}>
              <Typography variant="body2">Payroll processing complete</Typography>
            </MenuItem>
            <MenuItem onClick={handleNotificationClose}>
              <Typography variant="body2">Loan request pending approval</Typography>
            </MenuItem>
            <MenuItem onClick={handleNotificationClose}>
              <Typography variant="body2">System update available</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ 
          width: { sm: drawerOpen ? drawerWidth : collapsedWidth }, 
          flexShrink: { sm: 0 },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#ffffff',
              borderRight: '1px solid rgba(0, 0, 0, 0.08)',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        <Drawer
          variant="permanent"
          open={drawerOpen}
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerOpen ? drawerWidth : collapsedWidth,
              backgroundColor: '#ffffff',
              borderRight: '1px solid rgba(0, 0, 0, 0.08)',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : collapsedWidth}px)` },
          mt: 8,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;