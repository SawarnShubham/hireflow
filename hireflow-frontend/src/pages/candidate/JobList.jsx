import { useCallback, useEffect, useMemo, useState } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import EmptyState from "../../components/ui/EmptyState";
import JobDetailModal from "../../components/ui/JobDetailModal";
import { useToast } from "../../context/ToastContext";
import { api, getErrorMessage } from "../../services/api";

const initialFilters = { search: "", location: "", job_type: "", tags: "" };

const shorten = (text = "", limit = 220) => {
  const plainText = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (plainText.length <= limit) return plainText;
  return `${plainText.slice(0, limit).trim()}...`;
};

export default function JobList() {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeByJob, setResumeByJob] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobs = useCallback(async (nextFilters = initialFilters, nextPage = 1) => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/api/jobs", {
        params: {
          page: nextPage,
          limit: 8,
          search: nextFilters.search || undefined,
          location: nextFilters.location || undefined,
          job_type: nextFilters.job_type || undefined,
          tags: nextFilters.tags || undefined,
        },
      });
      setJobs(data.jobs || []);
      setPage(data.currentPage || nextPage);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      const message = getErrorMessage(err, "Unable to load jobs");
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchJobs(initialFilters);
  }, [fetchJobs]);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters]
  );

  const updateFilter = (event) => {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const submitFilters = (event) => {
    event.preventDefault();
    fetchJobs(filters, 1);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    fetchJobs(initialFilters);
  };

  const applyToJob = async (jobId) => {
    const resume = resumeByJob[jobId];
    setError("");

    if (!resume) {
      const message = "Choose a PDF resume before applying.";
      setError(message);
      showToast(message, "error");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);

    try {
      const { data } = await api.post(`/api/applications/apply/${jobId}`, formData);
      showToast(data.message || "Application submitted.");
      setResumeByJob((current) => ({ ...current, [jobId]: null }));
      setSelectedJob(null);
    } catch (err) {
      const message = getErrorMessage(err, "Unable to apply for this job");
      setError(message);
      showToast(message, "error");
    }
  };

  return (
    <PageWrapper>
      <div className="page-header compact">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Available jobs</h1>
          <p className="page-subtitle">
            {loading ? "Checking openings..." : `${jobs.length} roles found`}
            {activeFilterCount ? ` with ${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""}` : ""}
          </p>
        </div>
        <button className="button button-secondary" onClick={() => fetchJobs(filters, page)}>
          Refresh
        </button>
      </div>

      <form className="toolbar job-toolbar" onSubmit={submitFilters}>
        <input name="search" placeholder="Search title or company" value={filters.search} onChange={updateFilter} />
        <input name="location" placeholder="Search location" value={filters.location} onChange={updateFilter} />
        <select name="job_type" value={filters.job_type} onChange={updateFilter}>
          <option value="">Any job type</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
          <option value="Remote">Remote</option>
        </select>
        <input name="tags" placeholder="Skills: react,node" value={filters.tags} onChange={updateFilter} />
        <button className="button button-primary">Filter</button>
        <button className="button button-secondary" type="button" onClick={clearFilters}>
          Clear
        </button>
      </form>

      {error && <p className="alert error">{error}</p>}

      {loading ? (
        <div className="job-list skeleton-list">
          <div />
          <div />
          <div />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState title="No jobs found" message="Try fewer filters or search with a shorter location, like Bangalore." />
      ) : (
        <div className="job-list">
          {jobs.map((job) => (
            <article className="job-row" key={job._id}>
              <div className="job-main">
                <div className="job-title-line">
                  <button className="text-link-title" type="button" onClick={() => setSelectedJob(job)}>
                    {job.title}
                  </button>
                  <span className="chip">{job.job_type}</span>
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

              <div className="job-actions">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) =>
                    setResumeByJob((current) => ({
                      ...current,
                      [job._id]: event.target.files?.[0],
                    }))
                  }
                />
                <button className="button button-primary" onClick={() => applyToJob(job._id)} type="button">
                  Apply
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="pagination">
          <button
            className="page-button"
            disabled={page <= 1}
            onClick={() => fetchJobs(filters, page - 1)}
          >
            Previous
          </button>
          <span className="page-indicator">{page} / {totalPages}</span>
          <button
            className="page-button"
            disabled={page >= totalPages}
            onClick={() => fetchJobs(filters, page + 1)}
          >
            Next
          </button>
        </div>
      )}

      <JobDetailModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        footer={selectedJob && (
          <div className="job-actions modal-apply">
            <input
              type="file"
              accept="application/pdf"
              onChange={(event) =>
                setResumeByJob((current) => ({
                  ...current,
                  [selectedJob._id]: event.target.files?.[0],
                }))
              }
            />
            <button className="button button-primary" onClick={() => applyToJob(selectedJob._id)} type="button">
              Apply to this job
            </button>
          </div>
        )}
      />
    </PageWrapper>
  );
}
