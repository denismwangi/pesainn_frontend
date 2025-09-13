import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import userService from '../../services/userService';
import Sidebar, { drawerWidth, collapsedWidth, menuItems } from './Sidebar';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Settings,
  Logout,
  Notifications,
  AccountCircle,
  Refresh,
} from '@mui/icons-material';

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
    console.log('Session data on load:', sessionData);
    if (sessionData && sessionData.user) {
      console.log('Setting initial user:', sessionData.user);
      
      // Check if user is admin
      if (sessionData.user.role !== 'Admin') {
        console.log('Access denied: User is not an admin');
        authService.logout();
        navigate('/login');
        return;
      }
      
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
        console.log('Profile fetched successfully:', result.user);
        // User data is already extracted by userService
        const userData = result.user;
        
        // Check if user is admin
        if (userData.role !== 'Admin') {
          console.log('Access denied: User is not an admin');
          authService.logout();
          navigate('/login');
          return;
        }
        
        setCurrentUser(userData);
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

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDrawerOpen(!drawerOpen);
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

  const getUserDisplayName = () => {
    if (currentUser) {
      // Prioritize fullName field
      if (currentUser.fullName) {
        return currentUser.fullName;
      }
      if (currentUser.firstName && currentUser.lastName) {
        return `${currentUser.firstName} ${currentUser.lastName}`.trim();
      }
      if (currentUser.name) {
        return currentUser.name;
      }
      if (currentUser.username) {
        return currentUser.username;
      }
      if (currentUser.email) {
        // Use email prefix as fallback
        return currentUser.email.split('@')[0];
      }
    }
    return 'User';
  };

  const getUserEmail = () => {
    // Directly return the email field
    if (currentUser && currentUser.email) {
      return currentUser.email;
    }
    return '';
  };


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
            {(() => {
              // Check main menu items
              const mainItem = menuItems.find(item => item.path === location.pathname);
              if (mainItem) return mainItem.text;
              
              // Check submenu items
              for (const item of menuItems) {
                if (item.hasSubmenu && item.submenu) {
                  const subItem = item.submenu.find(sub => sub.path === location.pathname);
                  if (subItem) return `${item.text} - ${subItem.text}`;
                }
              }
              
              return 'Dashboard';
            })()}
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
            <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', minWidth: 200 }}>
              <Typography variant="subtitle2" fontWeight="bold" noWrap>
                {currentUser?.fullName || getUserDisplayName()}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" noWrap>
                {currentUser?.email || getUserEmail()}
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
            slotProps={{
              paper: {
                sx: { width: 320, maxHeight: 400 }
              }
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

      <Sidebar 
        currentUser={currentUser}
        isLoadingProfile={isLoadingProfile}
        fetchUserProfile={fetchUserProfile}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

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