import { useState } from "react";
import API from "../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  TextField,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  IconButton,
  Snackbar,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

function GenerateAutomation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [userStory, setUserStory] = useState("");
  const [framework, setFramework] = useState("playwright-typescript");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const goBack = () => {
    if (projectId) {
      navigate(`/projects/${projectId}`);
    } else {
      navigate("/dashboard");
    }
  };

  const handleGenerate = async () => {
    if (!userStory.trim()) {
      setError("Please enter a user story or automation prompt");
      return;
    }

    setLoading(true);
    setError("");
    setScript("");

    try {
      const response = await API.post("/generate-automation", {
        user_story: userStory,
        framework: framework,
      });

      setScript(response.data.automation_script);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to generate automation script. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!script) {
      setError("Generate automation script first");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await API.post("/save-automation-script", {
        user_story: userStory,
        framework: framework,
        automation_script: script,
        project_id: projectId ? Number(projectId) : null,
      });

      setSaved(true);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to save automation script"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
  };

  const handleDownload = () => {
    let extension = "txt";

    if (framework === "playwright-typescript") extension = "spec.ts";
    if (framework === "selenium-java") extension = "java";
    if (framework === "restassured-java") extension = "java";

    const element = document.createElement("a");
    const file = new Blob([script], { type: "text/plain" });

    element.href = URL.createObjectURL(file);
    element.download = `automation_script.${extension}`;

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={goBack}
        sx={{ mb: 3 }}
      >
        {projectId ? "Back to Project" : "Back to Dashboard"}
      </Button>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          AI Automation Script Generator
        </Typography>

        <Typography variant="body1" color="text.secondary">
          Generate, save, copy, and download automation scripts using AI.
        </Typography>

        {projectId && (
          <Chip
            label={`Project ID: ${projectId}`}
            color="primary"
            variant="outlined"
            sx={{ mt: 2 }}
          />
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Automation Input
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Framework</InputLabel>
              <Select
                value={framework}
                label="Framework"
                onChange={(e) => setFramework(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="playwright-typescript">
                  Playwright TypeScript
                </MenuItem>

                <MenuItem value="selenium-java">Selenium Java</MenuItem>

                <MenuItem value="restassured-java">
                  RestAssured Java API
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={12}
              placeholder="Example: As a user, I want to login with valid email and password so that I can access the dashboard."
              value={userStory}
              onChange={(e) => setUserStory(e.target.value)}
              disabled={loading}
              variant="outlined"
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  fontFamily: "monospace",
                },
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleGenerate}
              disabled={loading || !userStory.trim()}
              sx={{ py: 1.5 }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Generating...
                </>
              ) : (
                "Generate Automation"
              )}
            </Button>

            {script && (
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{ py: 1.5, mt: 2 }}
              >
                {saving ? "Saving..." : "Save Automation Script"}
              </Button>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Generated Automation Script
              </Typography>

              {script && (
                <Box>
                  <IconButton
                    size="small"
                    onClick={handleCopy}
                    title="Copy to clipboard"
                  >
                    <ContentCopyIcon />
                  </IconButton>

                  <IconButton
                    size="small"
                    onClick={handleDownload}
                    title="Download"
                  >
                    <DownloadIcon />
                  </IconButton>
                </Box>
              )}
            </Box>

            <TextField
              fullWidth
              multiline
              rows={12}
              value={script}
              InputProps={{
                readOnly: true,
              }}
              placeholder="Generated automation script will appear here..."
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                },
              }}
            />

            {script && (
              <Box sx={{ mt: 2 }}>
                <Chip label={`${script.split("\n").length} lines`} />
                <Chip
                  label={framework}
                  sx={{ ml: 1 }}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Card sx={{ mt: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Supported Automation Frameworks
          </Typography>

          <Box component="ul" sx={{ pl: 2 }}>
            <li>Playwright TypeScript for modern UI automation.</li>
            <li>Selenium Java for traditional web automation.</li>
            <li>RestAssured Java for API automation testing.</li>
            <li>Use clear user stories with expected actions and validations.</li>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Copied to clipboard!"
      />

      <Snackbar
        open={saved}
        autoHideDuration={2000}
        onClose={() => setSaved(false)}
        message="Automation script saved successfully!"
      />
    </Container>
  );
}

export default GenerateAutomation;