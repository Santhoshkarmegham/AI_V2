import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

function UserStories() {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedRows, setExpandedRows] = useState(new Set());

  const fetchStories = async (type) => {
    setLoading(true);
    setError("");
    setStories([]);
    setSource(type);

    try {
      const endpoint =
        type === "jira"
          ? "/jira/user-stories"
          : "/azure/user-stories";

      const response = await API.get(endpoint);
      setStories(response.data.stories || []);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to fetch user stories. Please check your API credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleRowExpansion = (storyId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(storyId)) {
      newExpanded.delete(storyId);
    } else {
      newExpanded.add(storyId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "done":
      case "closed":
        return "success";
      case "in progress":
      case "in_progress":
        return "info";
      case "todo":
      case "open":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
          User Stories
        </Typography>

        {/* Fetch Buttons */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item>
            <Button
              variant={source === "jira" ? "contained" : "outlined"}
              onClick={() => fetchStories("jira")}
              disabled={loading}
              size="large"
            >
              {loading && source === "jira" ? (
                <CircularProgress size={20} sx={{ mr: 1 }} />
              ) : null}
              Fetch Jira Stories
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant={source === "azure" ? "contained" : "outlined"}
              onClick={() => fetchStories("azure")}
              disabled={loading}
              size="large"
            >
              {loading && source === "azure" ? (
                <CircularProgress size={20} sx={{ mr: 1 }} />
              ) : null}
              Fetch Azure DevOps Stories
            </Button>
          </Grid>
        </Grid>

        {/* Source Badge */}
        {source && (
          <Box sx={{ mb: 2 }}>
            <Chip
              label={`Source: ${source.charAt(0).toUpperCase() + source.slice(1)}`}
              color="primary"
              variant="outlined"
            />
          </Box>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : stories.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "primary.light" }}>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell width="50px" align="center" sx={{ fontWeight: 700 }}>
                  Details
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stories.map((story) => (
                <Box key={story.id}>
                  <TableRow
                    hover
                    sx={{
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, width: "10%" }}>
                      {story.id}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{story.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={story.status}
                        color={getStatusColor(story.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{story.type || "Story"}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => toggleRowExpansion(story.id)}
                      >
                        {expandedRows.has(story.id) ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 0 }}>
                      <Collapse
                        in={expandedRows.has(story.id)}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ py: 2, px: 4, backgroundColor: "background.default" }}>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                            Description
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: "pre-wrap" }}>
                            {story.description || "No description available"}
                          </Typography>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </Box>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : source ? (
        <Alert severity="info">No stories found. Try fetching again.</Alert>
      ) : (
        <Alert severity="info">Select a source above to fetch user stories.</Alert>
      )}
    </Container>
  );
}

export default UserStories;