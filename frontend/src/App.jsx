import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./ThemeContext";
import MainLayout from "./components/MainLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import GenerateTestCases from "./pages/GenerateTestCases";
import GenerateAutomation from "./pages/GenerateAutomation";
import UserStories from "./pages/UserStories";
import SavedItems from "./pages/SavedItems";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import ExecutionLogs from "./pages/ExecutionLogs";

function AppRoutes() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/" || location.pathname === "/register";

  return isAuthPage ? (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  ) : (
    <MainLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/generate-test-cases" element={<GenerateTestCases />} />
        <Route path="/generate-automation" element={<GenerateAutomation />} />
        <Route path="/user-stories" element={<UserStories />} />
        <Route path="/saved-items" element={<SavedItems />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetails />} /> 
        <Route path="/execution-logs/:scriptId" element={<ExecutionLogs />} />
        
      </Routes>
    </MainLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;