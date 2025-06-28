import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProjectProvider } from "./contexts/project-context";
import Layout from "@/components/layout/layout";
import DashboardPage from "./pages/dashboard";
import ProjectsPage from "./pages/projects";
import ProjectDetailPage from "@/pages/project-detail";

function App() {
  return (
    <ProjectProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route
              path="/projects/:projectId"
              element={<ProjectDetailPage />}
            />
          </Routes>
        </Layout>
      </Router>
    </ProjectProvider>
  );
}

export default App;
