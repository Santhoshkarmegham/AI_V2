import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Container,
  Card,
  TextField,
  Button,
  Typography,
  Link as MuiLink,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Avatar,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await API.post("/login", form);

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("name", response.data.name);
      localStorage.setItem("email", response.data.email);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid
      container
      component="main"
      sx={{
        height: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Grid
        item
        xs={12}
        sm={8}
        md={5}
        component={Paper}
        elevation={6}
        square
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: 400,
          }}
        >
          {/* Logo */}
          <Avatar
            sx={{
              m: 1,
              bgcolor: "primary.main",
              width: 60,
              height: 60,
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: "2rem" }} />
          </Avatar>

          <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            TestPilot AI
          </Typography>

          <Typography
            component="p"
            variant="body2"
            color="textSecondary"
            sx={{ mb: 3 }}
          >
            AI-Powered Test Automation
          </Typography>

          {/* Error Alert */}
          {error && <Alert severity="error" sx={{ width: "100%", mb: 2 }}>{error}</Alert>}

          {/* Login Form */}
          <Box component="form" onSubmit={handleLogin} sx={{ width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Sign In"}
            </Button>

            {/* Register Link */}
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Don't have an account?{" "}
                <MuiLink
                  component={Link}
                  to="/register"
                  sx={{ fontWeight: 600, textDecoration: "none" }}
                >
                  Register here
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid>

      {/* Branding Section */}
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          display: { xs: "none", sm: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          p: 4,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h3" fontWeight={700} sx={{ mb: 2 }}>
            Welcome Back
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
            Generate test cases and automation scripts with AI
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Typography variant="body2">✓ AI-Powered Test Cases</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Typography variant="body2">✓ Automation Scripts</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Typography variant="body2">✓ Jira Integration</Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}

export default Login;