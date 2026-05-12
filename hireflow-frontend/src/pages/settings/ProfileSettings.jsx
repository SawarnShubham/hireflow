import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageWrapper from "../../components/layout/PageWrapper";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../services/api";

export default function ProfileSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "password" ? "password" : "general";
  const { user, updateProfile, changePassword } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    about: user?.about || "",
    image: user?.image || "",
    linkedin: user?.linkedin || "",
    github: user?.github || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const switchTab = (tab) => {
    setError("");
    setSearchParams(tab === "password" ? { tab: "password" } : {});
  };

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const updatePasswordField = (event) => {
    setPasswordForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const submitProfile = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await updateProfile(form);
      showToast("Profile updated successfully");
    } catch (err) {
      const message = getErrorMessage(err, "Unable to update profile");
      setError(message);
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await changePassword(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      showToast("Password changed successfully");
    } catch (err) {
      const message = getErrorMessage(err, "Unable to change password");
      setError(message);
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="settings-layout">
        <aside className="settings-nav">
          <h1>Settings</h1>
          <button className={activeTab === "general" ? "active" : ""} onClick={() => switchTab("general")}>
            General
          </button>
          <button className={activeTab === "password" ? "active" : ""} onClick={() => switchTab("password")}>
            Password
          </button>
        </aside>

        <section className="settings-content">
          {activeTab === "general" ? (
            <>
              <div className="settings-section-title">
                <h2>General</h2>
                <p>Update your account and public profile details.</p>
              </div>

              <form className="settings-card form" onSubmit={submitProfile}>
                <div className="profile-identity">
                  <span className="avatar avatar-xl">
                    {form.image ? <img src={form.image} alt="" /> : initials}
                  </span>
                  <div>
                    <strong>{form.name || user?.name}</strong>
                    <p>{user?.email}</p>
                  </div>
                </div>

                <label>
                  Profile picture URL
                  <input name="image" value={form.image} onChange={updateField} placeholder="https://..." />
                </label>

                <div className="form-grid">
                  <label>
                    Full name
                    <input name="name" value={form.name} onChange={updateField} required />
                  </label>
                  <label>
                    Phone number
                    <input name="phone" value={form.phone} onChange={updateField} />
                  </label>
                </div>

                <label>
                  Address
                  <input name="address" value={form.address} onChange={updateField} />
                </label>

                <div className="form-grid">
                  <label>
                    LinkedIn
                    <input name="linkedin" value={form.linkedin} onChange={updateField} placeholder="https://linkedin.com/in/username" />
                  </label>
                  <label>
                    GitHub
                    <input name="github" value={form.github} onChange={updateField} placeholder="https://github.com/username" />
                  </label>
                </div>

                {user?.role === "CANDIDATE" && (
                  <label>
                    About me
                    <textarea
                      name="about"
                      value={form.about}
                      onChange={updateField}
                      rows="7"
                      maxLength="1000"
                      placeholder="Write a short candidate summary: your skills, experience, strengths, and what kind of role you want."
                    />
                    <small className="field-hint">{form.about.length}/1000 characters</small>
                  </label>
                )}

                {error && <p className="alert error">{error}</p>}

                <button className="button button-primary form-submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save profile"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="settings-section-title">
                <h2>Password</h2>
                <p>Use a strong password with uppercase, lowercase, number, and special character.</p>
              </div>

              <form className="settings-card form" onSubmit={submitPassword}>
                <label>
                  Current password
                  <input
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={updatePasswordField}
                    required
                  />
                </label>
                <label>
                  New password
                  <input
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={updatePasswordField}
                    required
                  />
                </label>

                {error && <p className="alert error">{error}</p>}

                <button className="button button-primary form-submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Change password"}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </PageWrapper>
  );
}
