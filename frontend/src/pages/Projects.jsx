import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  Grid,
  IconButton,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [message, setMessage] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  const loadProjects = async () => {
    const response = await API.get("/projects");
    setProjects(response.data.projects || []);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      alert("Project name is required");
      return;
    }

    await API.post("/projects", form);
    setForm({ name: "", description: "" });
    setMessage("Project created successfully");
    loadProjects();
  };

  const openEdit = (project) => {
    setSelectedProject(project);
    setEditForm({
      name: project.name,
      description: project.description,
    });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editForm.name.trim()) {
      alert("Project name is required");
      return;
    }

    await API.put(`/projects/${selectedProject.id}`, editForm);
    setEditOpen(false);
    setSelectedProject(null);
    setMessage("Project updated successfully");
    loadProjects();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;

    await API.delete(`/projects/${id}`);
    setMessage("Project deleted successfully");
    loadProjects();
  };

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

      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Project Workspace
      </Typography>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Create Project
        </Typography>

        <TextField
          fullWidth
          label="Project Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          sx={{ mb: 2 }}
        />

        <Button variant="contained" onClick={handleCreate}>
          Create Project
        </Button>
      </Paper>

      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} md={4} key={project.id}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {project.name}
                  </Typography>

                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {project.description}
                  </Typography>
                </Box>

                <Box>
                  <IconButton color="primary" onClick={() => openEdit(project)}>
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() => handleDelete(project.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>

              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 3 }}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                Open Workspace
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {projects.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No projects found. Create your first project.
        </Alert>
      )}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth>
        <DialogTitle>Edit Project</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Project Name"
            value={editForm.name}
            onChange={(e) =>
              setEditForm({ ...editForm, name: e.target.value })
            }
            sx={{ mt: 2, mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={editForm.description}
            onChange={(e) =>
              setEditForm({ ...editForm, description: e.target.value })
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!message}
        autoHideDuration={2500}
        onClose={() => setMessage("")}
        message={message}
      />
    </Container>
  );
}

export default Projects;