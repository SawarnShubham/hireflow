import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const linkClass =
  "sidebar-link";

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <p className="sidebar-label">
        Workspace
      </p>

      <nav className="sidebar-nav">
        {user?.role === "CANDIDATE" && (
          <>
            <NavLink
              to="/candidate/jobs"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? "active" : ""}`
              }
            >
              Jobs
            </NavLink>

            <NavLink
              to="/candidate/applications"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? "active" : ""}`
              }
            >
              My Applications
            </NavLink>
            <NavLink
              to="/settings/profile"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? "active" : ""}`
              }
            >
              Profile
            </NavLink>
          </>
        )}

        {user?.role === "RECRUITER" && (
          <>
            <NavLink
              to="/recruiter/jobs"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? "active" : ""}`
              }
            >
              My Jobs
            </NavLink>

            <NavLink
              to="/recruiter/post-job"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? "active" : ""}`
              }
            >
              Post Job
            </NavLink>
            <NavLink
              to="/settings/profile"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? "active" : ""}`
              }
            >
              Profile
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
