import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/layout/PageWrapper";
import DescriptionEditor from "../../components/ui/DescriptionEditor";
import { useToast } from "../../context/ToastContext";
import { api, getErrorMessage } from "../../services/api";

const initialForm = {
  title: "",
  company: "",
  location: "",
  job_type: "Full-time",
  salary: "",
  tags: "",
  description: "",
};

export default function PostJob() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const submitJob = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await api.post("/api/jobs", form);
      showToast("Job posted successfully");
      navigate("/recruiter/jobs");
    } catch (err) {
      const message = getErrorMessage(err, "Unable to post this job");
      setError(message);
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="page-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Post a job</h1>
        </div>
      </div>

      <form className="panel form" onSubmit={submitJob}>
        <div className="form-grid">
          <label>
            Job title
            <input name="title" value={form.title} onChange={updateField} required />
          </label>
          <label>
            Company
            <input name="company" value={form.company} onChange={updateField} required />
          </label>
          <label>
            Location
            <input name="location" value={form.location} onChange={updateField} required />
          </label>
          <label>
            Job type
            <select name="job_type" value={form.job_type} onChange={updateField} required>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
              <option>Remote</option>
            </select>
          </label>
          <label>
            Salary
            <input name="salary" value={form.salary} onChange={updateField} placeholder="8-12 LPA" />
          </label>
          <label>
            Tags
            <input name="tags" value={form.tags} onChange={updateField} placeholder="react,node,mongodb" />
          </label>
        </div>

        <DescriptionEditor
          value={form.description}
          onChange={(description) => setForm((current) => ({ ...current, description }))}
        />

        {error && <p className="alert error">{error}</p>}

        <div className="button-row">
          <button className="button button-primary" disabled={isSubmitting}>
            {isSubmitting ? "Posting..." : "Post job"}
          </button>
          <button className="button button-secondary" type="button" onClick={() => navigate("/recruiter/jobs")}>
            Cancel
          </button>
        </div>
      </form>
    </PageWrapper>
  );
}
