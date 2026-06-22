import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Chip,
  Divider,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArticleIcon from "@mui/icons-material/Article";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import HistoryIcon from "@mui/icons-material/History";
import AssessmentIcon from "@mui/icons-material/Assessment";

function ProjectDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProject = async () => {
    try {
      const projectResponse = await API.get(`/projects/${id}`);
      const testCaseResponse = await API.get(`/projects/${id}/test-cases`);
      const scriptResponse = await API.get(`/projects/${id}/automation-scripts`);

      setProject(projectResponse.data);
      setTestCases(testCaseResponse.data.test_cases || []);
      setScripts(scriptResponse.data.automation_scripts || []);
    } catch (err) {
      setError("Failed to load project details");
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const executeScript = async (scriptId) => {
    try {
      setMessage("Executing script...");
      await API.post(`/execute-script/${scriptId}`);
      setMessage("Execution completed");
      loadProject();
    } catch (err) {
      setError("Failed to execute script");
    }
  };

  const deleteTestCase = async (itemId) => {
    if (!window.confirm("Delete this test case?")) return;

    try {
      await API.delete(`/saved-test-cases/${itemId}`);
      setMessage("Test case deleted successfully");
      loadProject();
    } catch (err) {
      setError("Failed to delete test case");
    }
  };

  const deleteScript = async (itemId) => {
    if (!window.confirm("Delete this automation script?")) return;

    try {
      await API.delete(`/saved-automation-scripts/${itemId}`);
      setMessage("Automation script deleted successfully");
      loadProject();
    } catch (err) {
      setError("Failed to delete automation script");
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    setMessage("Copied to clipboard");
  };

  const downloadFile = (content, fileName) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });

    element.href = URL.createObjectURL(file);
    element.download = fileName;

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadCsv = (endpoint) => {
    window.open(`http://localhost:8000${endpoint}`, "_blank");
  };

  const downloadExecutionFile = (scriptId) => {
    window.open(`http://localhost:8000/execution-file/${scriptId}`, "_blank");
  };

  const openAllureReport = (scriptId) => {
    window.open(`http://localhost:8000/allure-report/${scriptId}`, "_blank");
  };

  const getExecutionColor = (status) => {
    if (status === "Passed") return "success";
    if (status === "Failed") return "error";
    if (status === "Running") return "info";
    return "warning";
  };

  if (!project) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Loading project...</Typography>

        <Snackbar
          open={!!error}
          autoHideDuration={3000}
          onClose={() => setError("")}
        >
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/projects")}
        sx={{ mb: 3 }}
      >
        Back to Projects
      </Button>

      <Paper sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          {project.name}
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {project.description}
        </Typography>

        <Chip
          label={`Project ID: ${project.id}`}
          color="primary"
          variant="outlined"
          sx={{ mt: 2 }}
        />

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={() => downloadCsv(`/projects/${id}/export/test-cases`)}
            sx={{ mr: 2, mb: 1 }}
          >
            Export Project Test Cases
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<DownloadIcon />}
            onClick={() =>
              downloadCsv(`/projects/${id}/export/automation-scripts`)
            }
            sx={{ mb: 1 }}
          >
            Export Project Automation
          </Button>
        </Box>
      </Paper>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Workspace Actions
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />

              <Typography variant="h6" sx={{ mt: 2 }}>
                Generate Test Cases
              </Typography>

              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Generate and save test cases under this project.
              </Typography>

              <Button
                variant="contained"
                onClick={() => navigate(`/generate-test-cases?projectId=${id}`)}
              >
                Open
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <AutoAwesomeIcon color="primary" sx={{ fontSize: 40 }} />

              <Typography variant="h6" sx={{ mt: 2 }}>
                Generate Automation
              </Typography>

              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Generate and save automation scripts under this project.
              </Typography>

              <Button
                variant="contained"
                onClick={() => navigate(`/generate-automation?projectId=${id}`)}
              >
                Open
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <ArticleIcon color="warning" sx={{ fontSize: 40 }} />

              <Typography variant="h6" sx={{ mt: 2 }}>
                User Stories
              </Typography>

              <Typography color="text.secondary" sx={{ mb: 2 }}>
                View Jira or Azure stories for this project.
              </Typography>

              <Button
                variant="contained"
                onClick={() => navigate("/user-stories")}
              >
                Open
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 4, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Saved Test Cases in this Project
        </Typography>

        {testCases.length === 0 && (
          <Typography color="text.secondary">
            No test cases saved for this project yet.
          </Typography>
        )}

        {testCases.map((item) => (
          <Box key={item.id} sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography fontWeight={600}>#{item.id} User Story</Typography>

              <Box>
                <IconButton
                  color="primary"
                  onClick={() => copyText(item.test_cases)}
                  title="Copy test cases"
                >
                  <ContentCopyIcon />
                </IconButton>

                <IconButton
                  color="success"
                  onClick={() =>
                    downloadFile(item.test_cases, `test_case_${item.id}.txt`)
                  }
                  title="Download test cases"
                >
                  <DownloadIcon />
                </IconButton>

                <IconButton
                  color="error"
                  onClick={() => deleteTestCase(item.id)}
                  title="Delete test case"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>

            <Typography color="text.secondary" sx={{ mb: 1 }}>
              {item.user_story}
            </Typography>

            <TextField
              fullWidth
              multiline
              minRows={4}
              value={item.test_cases}
              InputProps={{ readOnly: true }}
            />

            <Divider sx={{ mt: 3 }} />
          </Box>
        ))}
      </Paper>

      <Paper sx={{ p: 3, mt: 4, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Saved Automation Scripts in this Project
        </Typography>

        {scripts.length === 0 && (
          <Typography color="text.secondary">
            No automation scripts saved for this project yet.
          </Typography>
        )}

        {scripts.map((item) => (
          <Box key={item.id} sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Box>
                <Typography fontWeight={600}>
                  #{item.id} {item.framework}
                </Typography>

                <Chip
                  label={item.execution_status || "Not Executed"}
                  color={getExecutionColor(item.execution_status)}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>

              <Box>
                <IconButton
                  color="success"
                  onClick={() => executeScript(item.id)}
                  title="Execute automation script"
                >
                  <PlayArrowIcon />
                </IconButton>

                <IconButton
                  color="info"
                  onClick={() => navigate(`/execution-logs/${item.id}`)}
                  title="View execution logs"
                >
                  <HistoryIcon />
                </IconButton>

                <IconButton
                  color="warning"
                  onClick={() => openAllureReport(item.id)}
                  title="Open Allure Report"
                >
                  <AssessmentIcon />
                </IconButton>

                <IconButton
                  color="secondary"
                  onClick={() => downloadExecutionFile(item.id)}
                  title="Download executed .spec.ts file"
                >
                  <DownloadIcon />
                </IconButton>

                <IconButton
                  color="primary"
                  onClick={() => copyText(item.automation_script)}
                  title="Copy automation script"
                >
                  <ContentCopyIcon />
                </IconButton>

                <IconButton
                  color="success"
                  onClick={() =>
                    downloadFile(
                      item.automation_script,
                      `automation_script_${item.id}.txt`
                    )
                  }
                  title="Download automation script"
                >
                  <DownloadIcon />
                </IconButton>

                <IconButton
                  color="error"
                  onClick={() => deleteScript(item.id)}
                  title="Delete automation script"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>

            <Typography color="text.secondary" sx={{ mb: 1 }}>
              {item.user_story}
            </Typography>

            <TextField
              fullWidth
              multiline
              minRows={4}
              value={item.automation_script}
              InputProps={{ readOnly: true }}
            />

            {item.execution_result && (
              <TextField
                fullWidth
                multiline
                minRows={3}
                value={item.execution_result}
                InputProps={{ readOnly: true }}
                label="Execution Result"
                sx={{ mt: 2 }}
              />
            )}

            <Divider sx={{ mt: 3 }} />
          </Box>
        ))}
      </Paper>

      <Snackbar
        open={!!message}
        autoHideDuration={2500}
        onClose={() => setMessage("")}
        message={message}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError("")}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ProjectDetails;