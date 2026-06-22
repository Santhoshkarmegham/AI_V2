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
} from "@mui/material";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

function GenerateTestCases() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [userStory, setUserStory] = useState("");
  const [testCases, setTestCases] = useState("");
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
      setError("Please enter a user story");
      return;
    }

    setLoading(true);
    setError("");
    setTestCases("");

    try {
      const response = await API.post("/generate-test-cases", {
        user_story: userStory,
      });

      setTestCases(response.data.test_cases);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to generate test cases. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!testCases) {
      setError("Generate test cases first");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await API.post("/save-test-cases", {
        user_story: userStory,
        test_cases: testCases,
        project_id: projectId ? Number(projectId) : null,
      });

      setSaved(true);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to save test cases"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(testCases);
    setCopied(true);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([testCases], { type: "text/plain" });

    element.href = URL.createObjectURL(file);
    element.download = "test_cases.txt";

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
          AI Test Case Generator
        </Typography>

        <Typography variant="body1" color="text.secondary">
          Generate and save QA test cases from user stories using AI.
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
              User Story
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={12}
              placeholder="Example: As a user, I want to login with email and password so that I can access the dashboard."
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
                "Generate Test Cases"
              )}
            </Button>

            {testCases && (
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{ py: 1.5, mt: 2 }}
              >
                {saving ? "Saving..." : "Save Test Cases"}
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
                Generated Test Cases
              </Typography>

              {testCases && (
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
              value={testCases}
              InputProps={{
                readOnly: true,
              }}
              placeholder="Generated test cases will appear here..."
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                },
              }}
            />

            {testCases && (
              <Box sx={{ mt: 2 }}>
                <Chip label={`${testCases.split("\n").length} lines`} />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Card sx={{ mt: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Tips for Better Results
          </Typography>

          <Box component="ul" sx={{ pl: 2 }}>
            <li>Provide clear and detailed user stories.</li>
            <li>Include acceptance criteria and edge cases.</li>
            <li>Specify the user role and expected outcomes.</li>
            <li>Use clear language and avoid ambiguity.</li>
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
        message="Test cases saved successfully!"
      />
    </Container>
  );
}

export default GenerateTestCases;