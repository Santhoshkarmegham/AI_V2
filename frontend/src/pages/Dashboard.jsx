import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Avatar,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArticleIcon from "@mui/icons-material/Article";
import PersonIcon from "@mui/icons-material/Person";
import DoneIcon from "@mui/icons-material/Done";
import PendingIcon from "@mui/icons-material/Pending";
import SaveIcon from "@mui/icons-material/Save";
import FolderIcon from "@mui/icons-material/Folder";
import HistoryIcon from "@mui/icons-material/History";

export default function Dashboard() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [activities, setActivities] = useState([]);

  const [stats, setStats] = useState({
    total_projects: 0,
    total_test_cases: 0,
    total_scripts: 0,
    total_executions: 0,
    system_status: "Active",
  });

  useEffect(() => {
    const name = localStorage.getItem("name");

    if (!name) {
      navigate("/");
      return;
    }

    setUserName(name);

    const loadStats = async () => {
      try {
        const response = await API.get("/dashboard/stats");
        setStats(response.data);
      } catch (error) {
        console.log("Failed to load dashboard stats", error);
      }
    };

    const loadActivities = async () => {
      try {
        const response = await API.get("/activity-logs");
        setActivities(response.data.logs || []);
      } catch (error) {
        console.log("Failed to load activity logs", error);
      }
    };

    loadStats();
    loadActivities();
  }, [navigate]);

  const features = [
    {
      title: "Generate Test Cases",
      description:
        "AI-powered test case generation from user stories and requirements",
      icon: CheckCircleIcon,
      path: "/generate-test-cases",
      color: "#4caf50",
    },
    {
      title: "Generate Automation",
      description:
        "Create automation scripts in Playwright, Selenium, and RestAssured",
      icon: AutoAwesomeIcon,
      path: "/generate-automation",
      color: "#2196f3",
    },
    {
      title: "User Stories",
      description: "Fetch and manage user stories from Jira and Azure DevOps",
      icon: ArticleIcon,
      path: "/user-stories",
      color: "#ff9800",
    },
    {
      title: "Saved Items",
      description:
        "View saved test cases and automation scripts from the database",
      icon: SaveIcon,
      path: "/saved-items",
      color: "#9c27b0",
    },
    {
      title: "Projects",
      description:
        "Create project workspaces for stories, test cases, and scripts",
      icon: FolderIcon,
      path: "/projects",
      color: "#673ab7",
    },
  ];

  const roadmap = [
    { task: "Login and Register", completed: true },
    { task: "AI Test Case Generator", completed: true },
    { task: "Jira and Azure DevOps Integration", completed: true },
    { task: "Automation Script Generator", completed: true },
    { task: "Save generated scripts to database", completed: true },
    { task: "View saved test cases and scripts", completed: true },
    { task: "Project workspace", completed: true },
    { task: "Download automation files", completed: true },
    { task: "Execute automation from UI", completed: true },
    { task: "Real Playwright execution engine", completed: false },
  ];

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: "12px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                mr: 2,
                bgcolor: "rgba(255, 255, 255, 0.2)",
              }}
            >
              <PersonIcon sx={{ fontSize: "2rem" }} />
            </Avatar>

            <Box>
              <Typography variant="h4" fontWeight={700}>
                Welcome, {userName}!
              </Typography>

              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Your AI-Powered Test Automation Platform
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            color="error"
            onClick={logout}
            sx={{ textTransform: "none" }}
          >
            Logout
          </Button>
        </Box>
      </Paper>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          Features
        </Typography>

        <Grid container spacing={3}>
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s ease",
                    borderRadius: 3,
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
                    },
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          backgroundColor: feature.color,
                          mr: 2,
                        }}
                      >
                        <Icon sx={{ fontSize: "2rem" }} />
                      </Avatar>
                    </Box>

                    <Typography variant="h6" fontWeight={600} sx={{ mb: 1, textAlign: 'left' }}>
                      {feature.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
                      {feature.description}
                    </Typography>
                  </CardContent>

                  <Divider />

                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate(feature.path)}
                      sx={{ py: 1.5, textTransform: "none" }}
                    >
                      Open
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Paper elevation={0} sx={{ p: 3, bgcolor: "background.paper", mb: 4 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Quick Stats
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="primary" fontWeight={700}>
                {stats.total_test_cases}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Test Cases Saved
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="success.main" fontWeight={700}>
                {stats.total_scripts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Scripts Saved
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="warning.main" fontWeight={700}>
                {stats.total_projects}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Projects
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="info.main" fontWeight={700}>
                {stats.total_executions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Executions
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, bgcolor: "background.paper", mb: 4 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Recent Activity
        </Typography>

        {activities.length === 0 ? (
          <Typography color="text.secondary">
            No recent activity found.
          </Typography>
        ) : (
          <List>
            {activities.map((item) => (
              <ListItem key={item.id} sx={{ py: 1 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <HistoryIcon color="primary" />
                </ListItemIcon>

                <ListItemText
                  primary={item.action}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        display="block"
                      >
                        {item.details}
                      </Typography>

                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        {item.created_at}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Paper elevation={0} sx={{ p: 3, bgcolor: "background.paper" }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Project Roadmap
        </Typography>

        <List>
          {roadmap.map((item, index) => (
            <ListItem key={index} sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.completed ? (
                  <DoneIcon sx={{ color: "success.main" }} />
                ) : (
                  <PendingIcon sx={{ color: "warning.main" }} />
                )}
              </ListItemIcon>

              <ListItemText
                primary={item.task}
                sx={{
                  "& .MuiTypography-root": {
                    textDecoration: item.completed ? "line-through" : "none",
                    color: item.completed ? "text.secondary" : "text.primary",
                  },
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
}