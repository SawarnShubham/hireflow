import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import "./App.css";

import Login from "./pages/auth/Login";
import JobList from "./pages/candidate/JobList";
import MyApplications from "./pages/candidate/MyApplications";
import MyJobs from "./pages/recruiter/MyJobs";
import PostJob from "./pages/recruiter/PostJob";
import JobApplications from "./pages/recruiter/JobApplications";
import EditJob from "./pages/recruiter/EditJob";
import ProfileSettings from "./pages/settings/ProfileSettings";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

          <Route
            path="/candidate/jobs"
            element={
              <ProtectedRoute role="CANDIDATE">
                <JobList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/applications"
            element={
              <ProtectedRoute role="CANDIDATE">
                <MyApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/profile"
            element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recruiter/jobs"
            element={
              <ProtectedRoute role="RECRUITER">
                <MyJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/post-job"
            element={
              <ProtectedRoute role="RECRUITER">
                <PostJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/jobs/:jobId/applications"
            element={
              <ProtectedRoute role="RECRUITER">
                <JobApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/jobs/:jobId/edit"
            element={
              <ProtectedRoute role="RECRUITER">
                <EditJob />
              </ProtectedRoute>
            }
          />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
