import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark brand-mark-glow">
          H
        </div>
        <div>
          <span className="brand-name">HireFlow</span>
          <span className="brand-subtitle">Hiring workspace</span>
        </div>
      </div>

      {user && (
        <div className="topbar-actions">
          <div className="account-menu">
            <button className="account-trigger" type="button" onClick={() => setIsOpen((current) => !current)}>
              <span className="avatar">
                {user.image ? <img src={user.image} alt="" /> : initials}
              </span>
            </button>

            {isOpen && (
              <div className="account-dropdown">
                <div className="account-dropdown-header">
                  <span className="avatar avatar-large">
                    {user.image ? <img src={user.image} alt="" /> : initials}
                  </span>
                  <div>
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </div>
                </div>
                <Link to="/settings/profile" onClick={() => setIsOpen(false)}>
                  Profile settings
                </Link>
                <Link to="/settings/profile?tab=password" onClick={() => setIsOpen(false)}>
                  Change password
                </Link>
                <button type="button" onClick={logout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
