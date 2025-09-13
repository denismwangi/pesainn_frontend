import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
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
  Tooltip,
  Collapse,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  People,
  AccountBalance,
  AttachMoney,
  Receipt,
  Settings,
  Dashboard,
  ChevronLeft,
  Refresh,
  ExpandLess,
  ExpandMore,
  MonetizationOn,
  CreditCard,
  Category,
} from '@mui/icons-material';

export const drawerWidth = 280;
export const collapsedWidth = 65;

export const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Employees', icon: <People />, path: '/dashboard/employees' },
  { text: 'Payroll', icon: <AccountBalance />, path: '/dashboard/payroll' },
  { 
    text: 'Loans', 
    icon: <AttachMoney />, 
    path: '/dashboard/loans',
    hasSubmenu: true,
    submenu: [
      { text: 'Advanced', icon: <MonetizationOn />, path: '/dashboard/loans/advanced' },
      { text: 'Personal Loan', icon: <CreditCard />, path: '#' },
    ]
  },
  { text: 'Transactions', icon: <Receipt />, path: '/dashboard/transactions' },
  { 
    text: 'Settings', 
    icon: <Settings />, 
    path: '/dashboard/settings',
    hasSubmenu: true,
    submenu: [
      { text: 'Loan Types', icon: <Category />, path: '/dashboard/settings/loan-types' },
    ]
  },
];

const Sidebar = ({ 
  currentUser, 
  isLoadingProfile, 
  fetchUserProfile,
  mobileOpen,
  setMobileOpen,
  drawerOpen,
  setDrawerOpen
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loansOpen, setLoansOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDrawerOpen(!drawerOpen);
    }
  };

  const handleMenuClick = (path, hasSubmenu, menuText) => {
    if (hasSubmenu) {
      if (menuText === 'Loans') {
        setLoansOpen(!loansOpen);
      } else if (menuText === 'Settings') {
        setSettingsOpen(!settingsOpen);
      }
    } else {
      navigate(path);
      if (isMobile) {
        setMobileOpen(false);
      }
    }
  };

  const getUserInitials = () => {
    if (currentUser) {
      if (currentUser.fullName) {
        return currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
      } else if (currentUser.firstName && currentUser.lastName) {
        return (currentUser.firstName[0] + currentUser.lastName[0]).toUpperCase();
      } else if (currentUser.name) {
        return currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
      } else if (currentUser.username) {
        return currentUser.username.substring(0, 2).toUpperCase();
      } else if (currentUser.email) {
        return currentUser.email.substring(0, 2).toUpperCase();
      }
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (currentUser) {
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
        return currentUser.email.split('@')[0];
      }
    }
    return 'User';
  };

  const getUserRole = () => {
    if (currentUser) {
      return currentUser.role || currentUser.userGroup || currentUser.userType || 'User';
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
          const isActive = item.hasSubmenu 
            ? location.pathname.startsWith(item.path)
            : location.pathname === item.path;
          return (
            <Box key={item.text}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleMenuClick(item.path, item.hasSubmenu, item.text)}
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
                    <>
                      <ListItemText 
                        primary={item.text}
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontWeight: isActive ? 600 : 400,
                            fontSize: '0.95rem',
                          }
                        }}
                      />
                      {item.hasSubmenu && (
                        (item.text === 'Loans' ? loansOpen : settingsOpen) ? <ExpandLess /> : <ExpandMore />
                      )}
                    </>
                  )}
                </ListItemButton>
              </ListItem>
              {item.hasSubmenu && (drawerOpen || mobileOpen) && (
                <Collapse in={item.text === 'Loans' ? loansOpen : settingsOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.submenu.map((subItem) => {
                      const isSubActive = location.pathname === subItem.path;
                      return (
                        <ListItem key={subItem.text} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemButton
                            onClick={() => handleMenuClick(subItem.path)}
                            sx={{
                              borderRadius: 2,
                              mx: 0.5,
                              pl: 5,
                              backgroundColor: isSubActive ? 'rgba(66, 149, 108, 0.08)' : 'transparent',
                              color: isSubActive ? '#42956c' : 'text.primary',
                              '&:hover': {
                                backgroundColor: isSubActive 
                                  ? 'rgba(66, 149, 108, 0.12)' 
                                  : 'rgba(0, 0, 0, 0.04)',
                              },
                              minHeight: 40,
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 0,
                                mr: 3,
                                color: isSubActive ? '#42956c' : 'text.secondary',
                              }}
                            >
                              {subItem.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={subItem.text}
                              sx={{
                                '& .MuiListItemText-primary': {
                                  fontWeight: isSubActive ? 600 : 400,
                                  fontSize: '0.875rem',
                                }
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </Box>
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
                {currentUser?.fullName || getUserDisplayName()}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {currentUser?.email || getUserRole()}
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
  );
};

export default Sidebar;