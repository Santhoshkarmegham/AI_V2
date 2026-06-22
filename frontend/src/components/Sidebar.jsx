import React from "react";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TestCaseIcon from "@mui/icons-material/CheckCircle";
import AutomationIcon from "@mui/icons-material/AutoAwesome";
import StoriesIcon from "@mui/icons-material/Article";

const DRAWER_WIDTH = 280;

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { label: "Dashboard", icon: DashboardIcon, path: "/dashboard" },
    {
      label: "Generate Test Cases",
      icon: TestCaseIcon,
      path: "/generate-test-cases",
    },
    {
      label: "Generate Automation",
      icon: AutomationIcon,
      path: "/generate-automation",
    },
    { label: "User Stories", icon: StoriesIcon, path: "/user-stories" },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo Section */}
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700} color="primary">
          TestPilot AI
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Automation Platform
        </Typography>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flex: 1, mt: 2 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <ListItem
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              sx={{
                mb: 1,
                mx: 1,
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: active ? "rgba(25, 118, 210, 0.1)" : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.05)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <ListItemIcon
                sx={{
                  color: active ? "primary.main" : "textSecondary",
                  minWidth: 40,
                }}
              >
                <Icon />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  color: active ? "primary.main" : "textPrimary",
                  fontWeight: active ? 600 : 500,
                }}
              />
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Footer Info */}
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="textSecondary">
          © {new Date().getFullYear()} TestPilot AI
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        sx={{
          display: { xs: "block", sm: "none" },
        }}
      >
        <Box sx={{ width: DRAWER_WIDTH }}>{drawerContent}</Box>
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
