import React, { useState } from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import { useTheme } from "../ThemeContext";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

export default function UserProfile() {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const userName = localStorage.getItem("name") || "User";
  const userEmail = localStorage.getItem("email") || "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    navigate("/");
  };

  return (
    <Box>
      <IconButton onClick={handleMenuOpen} size="small" sx={{ ml: 2 }}>
        <Avatar sx={{ width: 40, height: 40 }}>{initials}</Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <MenuItem disabled>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {userName}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {userEmail}
            </Typography>
          </Box>
        </MenuItem>

        <Divider />

        <MenuItem onClick={toggleTheme}>
          <ListItemIcon>
            {isDarkMode ? (
              <Brightness7Icon fontSize="small" />
            ) : (
              <Brightness4Icon fontSize="small" />
            )}
          </ListItemIcon>
          <Typography variant="body2">
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </Typography>
        </MenuItem>

        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Settings</Typography>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography variant="body2" color="error">
            Logout
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}
