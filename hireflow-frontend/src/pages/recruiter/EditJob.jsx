import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

export default function EditJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/api/jobs/mine/${jobId}`);
        const job = data.job;
        setForm({
          title: job.title || "",
          company: job.company || "",
          location: job.location || "",
          job_type: job.job_type || "Full-time",
          salary: job.salary || "",
          tags: (job.tags || []).join(","),
          description: job.description || "",
        });
      } catch (err) {
        const message = getErrorMessage(err, "Unable to load this job");
        setError(message);
        showToast(message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, showToast]);

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
      await api.put(`/api/jobs/${jobId}`, form);
      showToast("Job updated successfully");
      navigate("/recruiter/jobs");
    } catch (err) {
      const message = getErrorMessage(err, "Unable to update this job");
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
          <h1>Edit job</h1>
        </div>
      </div>

      {loading ? (
        <div className="panel skeleton-panel" />
      ) : (
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
              <input name="salary" value={form.salary} onChange={updateField} />
            </label>
            <label>
              Tags
              <input name="tags" value={form.tags} onChange={updateField} />
            </label>
          </div>

          <DescriptionEditor
            value={form.description}
            onChange={(description) => setForm((current) => ({ ...current, description }))}
          />

          {error && <p className="alert error">{error}</p>}

          <div className="button-row">
            <button className="button button-primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
            <button className="button button-secondary" type="button" onClick={() => navigate("/recruiter/jobs")}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </PageWrapper>
  );
}
