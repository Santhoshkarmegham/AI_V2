import React, { useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "./Sidebar";
import UserProfile from "./UserProfile";

const DRAWER_WIDTH = 280;

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          width: { xs: "100%", sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        {/* Top App Bar */}
        <AppBar
          position="sticky"
          elevation={1}
          sx={{
            backgroundColor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setSidebarOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Box sx={{ flex: 1 }} />

            {/* User Profile Menu */}
            <UserProfile />
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3 },
            backgroundColor: "background.default",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
