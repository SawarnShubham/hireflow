import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageWrapper from "../../components/layout/PageWrapper";
import EmptyState from "../../components/ui/EmptyState";
import { api, getErrorMessage } from "../../services/api";

const shorten = (text = "", limit = 190) => {
  const plainText = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (plainText.length <= limit) return plainText;
  return `${plainText.slice(0, limit).trim()}...`;
};

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchJobs = useCallback(async (nextPage = 1) => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/api/jobs/mine", {
        params: { page: nextPage, limit: 5 },
      });
      setJobs(data.jobs || []);
      setPage(data.currentPage || nextPage);
      setTotalPages(data.totalPages || 1);
      setTotalJobs(data.total || 0);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load your jobs"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  const deleteJob = async (jobId) => {
    setNotice("");
    setError("");

    try {
      await api.delete(`/api/jobs/${jobId}`);
      setJobs((current) =>
        current.map((job) =>
          job._id === jobId ? { ...job, active: false } : job
        )
      );
      setNotice("Job closed successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to close this job"));
    }
  };

  return (
    <PageWrapper>
      <div className="page-header compact">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>My posted jobs</h1>
          <p className="page-subtitle">
            {loading ? "Loading your roles..." : `${totalJobs} posted job${totalJobs === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link className="button button-primary" to="/recruiter/post-job">
          Post job
        </Link>
      </div>

      {notice && <p className="alert success">{notice}</p>}
      {error && <p className="alert error">{error}</p>}

      {loading ? (
        <div className="job-list skeleton-list">
          <div />
          <div />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs posted"
          message="Create your first job and start collecting applications."
          action={<Link className="button button-primary" to="/recruiter/post-job">Post a job</Link>}
        />
      ) : (
        <>
        <div className="job-list recruiter-job-list">
          {jobs.map((job) => (
            <article className="job-row recruiter-row" key={job._id}>
              <div className="job-main">
                <div className="job-title-line">
                  <h2>{job.title}</h2>
                  <span className={`chip ${job.active ? "" : "chip-muted"}`}>
                    {job.active ? job.job_type : "Closed"}
                  </span>
                </div>
                <p className="job-company">{job.company} - {job.location}</p>
                <p className="job-description">{shorten(job.description)}</p>
                <div className="meta-row">
                  {job.salary && <span>{job.salary}</span>}
                  {(job.tags || []).slice(0, 5).map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              </div>

              <div className="job-actions recruiter-actions">
                <div className="metric-pill">
                  <strong>{job.applicationCount || 0}</strong>
                  <span>Applications</span>
                </div>
                <Link className="button button-secondary" to={`/recruiter/jobs/${job._id}/applications`}>
                  View applicants
                </Link>
                {job.active && (
                  <>
                    <Link className="button button-secondary" to={`/recruiter/jobs/${job._id}/edit`}>
                      Edit job
                    </Link>
                    <button className="button button-danger" onClick={() => deleteJob(job._id)}>
                      Close job
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
        <div className="pagination pagination-compact">
          <button
            className="page-button"
            disabled={page <= 1}
            onClick={() => fetchJobs(page - 1)}
          >
            Previous
          </button>
          <span className="page-indicator">{page} / {totalPages}</span>
          <button
            className="page-button"
            disabled={page >= totalPages}
            onClick={() => fetchJobs(page + 1)}
          >
            Next
          </button>
        </div>
        </>
      )}
    </PageWrapper>
  );
}
