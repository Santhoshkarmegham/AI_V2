import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Button,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  IconButton,
  InputAdornment,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import HistoryIcon from "@mui/icons-material/History";
import AssessmentIcon from "@mui/icons-material/Assessment";

function SavedItems() {
  const navigate = useNavigate();

  const [tab, setTab] = useState(0);
  const [testCases, setTestCases] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const downloadCsv = (endpoint) => {
    window.open(`http://localhost:8000${endpoint}`, "_blank");
  };

  const downloadExecutionFile = (scriptId) => {
    window.open(`http://localhost:8000/execution-file/${scriptId}`, "_blank");
  };

  const openAllureReport = (scriptId) => {
    window.open(`http://localhost:8000/allure-report/${scriptId}`, "_blank");
  };

  const loadData = async () => {
    try {
      const testCaseResponse = await API.get("/saved-test-cases");
      const scriptResponse = await API.get("/saved-automation-scripts");

      setTestCases(testCaseResponse.data.test_cases || []);
      setScripts(scriptResponse.data.automation_scripts || []);
    } catch (err) {
      setError("Failed to load saved items");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const executeScript = async (id) => {
    try {
      setMessage("Executing script...");
      await API.post(`/execute-script/${id}`);
      setMessage("Execution completed");
      loadData();
    } catch (err) {
      setError("Failed to execute script");
    }
  };

  const deleteTestCase = async (id) => {
    if (!window.confirm("Are you sure you want to delete this test case?")) {
      return;
    }

    try {
      await API.delete(`/saved-test-cases/${id}`);
      setMessage("Test case deleted successfully");
      loadData();
    } catch (err) {
      setError("Failed to delete test case");
    }
  };

  const deleteScript = async (id) => {
    if (!window.confirm("Are you sure you want to delete this automation script?")) {
      return;
    }

    try {
      await API.delete(`/saved-automation-scripts/${id}`);
      setMessage("Automation script deleted successfully");
      loadData();
    } catch (err) {
      setError("Failed to delete automation script");
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    setMessage("Copied to clipboard");
  };

  const downloadTextFile = (content, fileName) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });

    element.href = URL.createObjectURL(file);
    element.download = fileName;

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getExecutionColor = (status) => {
    if (status === "Passed") return "success";
    if (status === "Failed") return "error";
    if (status === "Running") return "info";
    return "warning";
  };

  const filteredTestCases = testCases.filter((item) =>
    item.user_story?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredScripts = scripts.filter(
    (item) =>
      item.user_story?.toLowerCase().includes(search.toLowerCase()) ||
      item.framework?.toLowerCase().includes(search.toLowerCase()) ||
      item.execution_status?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/dashboard")}
        sx={{ mb: 3 }}
      >
        Back to Dashboard
      </Button>

      <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
        Saved Items
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View, search, copy, download, delete, export, execute scripts, and open Allure reports.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={() => downloadCsv("/export/test-cases")}
          sx={{ mr: 2, mb: 1 }}
        >
          Export Test Cases CSV
        </Button>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<DownloadIcon />}
          onClick={() => downloadCsv("/export/automation-scripts")}
          sx={{ mb: 1 }}
        >
          Export Automation CSV
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Search by user story, framework, or execution status..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <Tabs value={tab} onChange={(e, value) => setTab(value)} sx={{ mb: 3 }}>
        <Tab label={`Saved Test Cases (${filteredTestCases.length})`} />
        <Tab label={`Saved Automation Scripts (${filteredScripts.length})`} />
      </Tabs>

      {tab === 0 && filteredTestCases.length === 0 && (
        <Alert severity="info">No saved test cases found.</Alert>
      )}

      {tab === 0 &&
        filteredTestCases.map((item) => (
          <Paper key={item.id} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  #{item.id} User Story
                </Typography>

                <Box sx={{ mt: 1 }}>
                  <Chip
                    label="Test Case"
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  />

                  {item.project_id && (
                    <Chip
                      label={`Project ID: ${item.project_id}`}
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>
              </Box>

              <Box>
                <IconButton
                  color="primary"
                  onClick={() => copyText(item.test_cases)}
                  title="Copy"
                >
                  <ContentCopyIcon />
                </IconButton>

                <IconButton
                  color="success"
                  onClick={() =>
                    downloadTextFile(item.test_cases, `test_case_${item.id}.txt`)
                  }
                  title="Download"
                >
                  <DownloadIcon />
                </IconButton>

                <IconButton
                  color="error"
                  onClick={() => deleteTestCase(item.id)}
                  title="Delete"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>

            <Typography sx={{ mb: 2 }}>{item.user_story}</Typography>

            <TextField
              fullWidth
              multiline
              minRows={6}
              value={item.test_cases}
              InputProps={{ readOnly: true }}
            />
          </Paper>
        ))}

      {tab === 1 && filteredScripts.length === 0 && (
        <Alert severity="info">No saved automation scripts found.</Alert>
      )}

      {tab === 1 &&
        filteredScripts.map((item) => (
          <Paper key={item.id} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  #{item.id} Automation Script
                </Typography>

                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={item.framework}
                    color="secondary"
                    size="small"
                    sx={{ mr: 1 }}
                  />

                  <Chip
                    label={item.execution_status || "Not Executed"}
                    color={getExecutionColor(item.execution_status)}
                    size="small"
                    sx={{ mr: 1 }}
                  />

                  {item.project_id && (
                    <Chip
                      label={`Project ID: ${item.project_id}`}
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>
              </Box>

              <Box>
                <IconButton
                  color="success"
                  onClick={() => executeScript(item.id)}
                  title="Execute"
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
                  title="Copy"
                >
                  <ContentCopyIcon />
                </IconButton>

                <IconButton
                  color="success"
                  onClick={() =>
                    downloadTextFile(
                      item.automation_script,
                      `automation_script_${item.id}.txt`
                    )
                  }
                  title="Download text"
                >
                  <DownloadIcon />
                </IconButton>

                <IconButton
                  color="error"
                  onClick={() => deleteScript(item.id)}
                  title="Delete"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>

            <Typography sx={{ mb: 2 }}>{item.user_story}</Typography>

            <TextField
              fullWidth
              multiline
              minRows={6}
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
          </Paper>
        ))}

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

export default SavedItems;