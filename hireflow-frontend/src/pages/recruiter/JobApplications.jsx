import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageWrapper from "../../components/layout/PageWrapper";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import { api, getErrorMessage } from "../../services/api";

const statuses = ["APPLIED", "INTERVIEW_SCHEDULED", "REJECTED", "HIRED"];

export default function JobApplications() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get(`/api/applications/job/${jobId}`, {
        params: { page, limit: 8 },
      });
      setApplications(data.applications || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load applications"));
    } finally {
      setLoading(false);
    }
  }, [jobId, page]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const updateStatus = async (applicationId, status) => {
    setNotice("");
    setError("");

    try {
      await api.patch(`/api/applications/${applicationId}/status`, { status });
      setApplications((current) =>
        current.map((application) =>
          application.applicationId === applicationId
            ? { ...application, status }
            : application
        )
      );
      setNotice("Application status updated.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update status"));
    }
  };

  const downloadResume = async (application) => {
    try {
      const response = await api.get(`/api/applications/${application.applicationId}/resume`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = application.resume.originalName || "resume.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to download resume"));
    }
  };

  return (
    <PageWrapper>
      <div className="page-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Applicants</h1>
        </div>
        <Link className="button button-secondary" to="/recruiter/jobs">
          Back to jobs
        </Link>
      </div>

      {notice && <p className="alert success">{notice}</p>}
      {error && <p className="alert error">{error}</p>}

      {loading ? (
        <div className="table-skeleton">
          <div />
          <div />
          <div />
        </div>
      ) : applications.length === 0 ? (
        <EmptyState title="No applicants yet" message="New applications for this job will appear here." />
      ) : (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Email</th>
                <th>Resume</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.applicationId}>
                  <td>
                    <div className="candidate-cell">
                      <span className="avatar">
                        {application.candidate.image ? (
                          <img src={application.candidate.image} alt="" />
                        ) : (
                          application.candidate.name?.slice(0, 2).toUpperCase()
                        )}
                      </span>
                      <strong>{application.candidate.name}</strong>
                    </div>
                  </td>
                  <td>
                    <div>{application.candidate.email}</div>
                    {application.candidate.phone && <small>{application.candidate.phone}</small>}
                    <div className="social-row">
                      {application.candidate.linkedin && (
                        <a href={application.candidate.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
                      )}
                      {application.candidate.github && (
                        <a href={application.candidate.github} target="_blank" rel="noreferrer">GitHub</a>
                      )}
                    </div>
                    {application.candidate.about && (
                      <p className="candidate-about">{application.candidate.about}</p>
                    )}
                  </td>
                  <td>
                    <button className="text-link" type="button" onClick={() => downloadResume(application)}>
                      {application.resume.originalName || "Resume"}
                    </button>
                  </td>
                  <td><StatusBadge status={application.status} /></td>
                  <td>{new Date(application.appliedAt).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={application.status}
                      onChange={(event) => updateStatus(application.applicationId, event.target.value)}
                    >
                      {statuses.map((status) => (
                        <option value={status} key={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && applications.length > 0 && (
        <div className="pagination">
          <button className="page-button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
            Previous
          </button>
          <span className="page-indicator">{page} / {totalPages}</span>
          <button className="page-button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>
            Next
          </button>
        </div>
      )}
    </PageWrapper>
  );
}
