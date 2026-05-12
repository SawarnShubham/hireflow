import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../services/api";

export default function Login() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "CANDIDATE",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return (
      <Navigate
        to={user.role === "RECRUITER" ? "/recruiter/jobs" : "/candidate/jobs"}
        replace
      />
    );
  }

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        await register(form);
        setMessage("Account created. Sign in with your new credentials.");
        setMode("login");
        return;
      }

      const loggedInUser = await login({
        email: form.email,
        password: form.password,
      });
      const from = location.state?.from?.pathname;
      const fallback =
        loggedInUser.role === "RECRUITER" ? "/recruiter/jobs" : "/candidate/jobs";
      navigate(from || fallback, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Unable to continue"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <div className="brand auth-brand">
          <div className="brand-mark">H</div>
          <div>
            <span className="brand-name">HireFlow</span>
            <span className="brand-subtitle">A clean hiring pipeline</span>
          </div>
        </div>
        <h1>Move candidates from open roles to decisions with less noise.</h1>
        <p>
          Recruiters can post roles and review applications. Candidates can browse
          jobs, upload resumes, and track every application in one place.
        </p>
        <div className="auth-stats">
          <span>Jobs</span>
          <span>Applications</span>
          <span>Decisions</span>
        </div>
      </section>

      <section className="auth-card">
        <div className="segmented-control">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
            type="button"
          >
            Sign in
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
            type="button"
          >
            Create account
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <label>
                Full name
                <input name="name" value={form.name} onChange={updateField} required />
              </label>
              <label>
                Phone
                <input name="phone" value={form.phone} onChange={updateField} />
              </label>
              <label>
                Role
                <select name="role" value={form.role} onChange={updateField}>
                  <option value="CANDIDATE">Candidate</option>
                  <option value="RECRUITER">Recruiter</option>
                </select>
              </label>
            </>
          )}

          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={updateField} required />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              required
            />
          </label>

          {message && <p className="alert success">{message}</p>}
          {error && <p className="alert error">{error}</p>}

          <button className="button button-primary full-width" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}
