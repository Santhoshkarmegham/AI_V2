import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Button,
  Typography,
  Paper,
  TextField,
  Chip,
  Box,
  Alert,
  IconButton,
  Snackbar,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";

function ExecutionLogs() {
  const navigate = useNavigate();
  const { scriptId } = useParams();

  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState("");

  const loadLogs = async () => {
    const response = await API.get(`/execution-logs/${scriptId}`);
    setLogs(response.data.logs || []);
  };

  useEffect(() => {
    loadLogs();
  }, [scriptId]);

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    setMessage("Copied to clipboard");
  };

  const downloadLog = (content, fileName) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });

    element.href = URL.createObjectURL(file);
    element.download = fileName;

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Execution Logs - Script #{scriptId}
      </Typography>

      {logs.length === 0 && (
        <Alert severity="info">No execution logs found.</Alert>
      )}

      {logs.map((log) => (
        <Paper key={log.id} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Chip
                label={log.status}
                color={log.status === "Passed" ? "success" : "error"}
                sx={{ mr: 1 }}
              />

              <Chip label={log.created_at} variant="outlined" />
            </Box>

            <Box>
              <IconButton
                color="primary"
                onClick={() => copyText(log.result)}
                title="Copy log"
              >
                <ContentCopyIcon />
              </IconButton>

              <IconButton
                color="success"
                onClick={() =>
                  downloadLog(log.result, `execution_log_${log.id}.txt`)
                }
                title="Download log"
              >
                <DownloadIcon />
              </IconButton>
            </Box>
          </Box>

          <TextField
            fullWidth
            multiline
            minRows={5}
            value={log.result}
            InputProps={{ readOnly: true }}
          />
        </Paper>
      ))}

      <Snackbar
        open={!!message}
        autoHideDuration={2500}
        onClose={() => setMessage("")}
        message={message}
      />
    </Container>
  );
}

export default ExecutionLogs;