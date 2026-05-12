import { useEffect, useState } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import { api, getErrorMessage } from "../../services/api";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get("/api/applications/me", {
          params: { page, limit: 8 },
        });
        setApplications(data.applications || []);
        setTotalPages(data.totalPages || 1);
        setTotalApplications(data.totalApplications || 0);
      } catch (err) {
        setError(getErrorMessage(err, "Unable to load applications"));
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [page]);

  return (
    <PageWrapper>
      <div className="page-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>My applications</h1>
          <p className="page-subtitle">
            {loading ? "Loading applications..." : `${totalApplications} application${totalApplications === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>

      {error && <p className="alert error">{error}</p>}

      {loading ? (
        <div className="table-skeleton">
          <div />
          <div />
          <div />
        </div>
      ) : applications.length === 0 ? (
        <EmptyState title="No applications yet" message="Apply to a job and it will appear here." />
      ) : (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>Company</th>
                <th>Location</th>
                <th>Status</th>
                <th>Applied</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.applicationId}>
                  <td>{application.job.title}</td>
                  <td>{application.job.company}</td>
                  <td>{application.job.location}</td>
                  <td>
                    <StatusBadge
                      status={
                        application.job.active === false &&
                        ["APPLIED", "INTERVIEW_SCHEDULED"].includes(application.status)
                          ? "CLOSED"
                          : application.status
                      }
                    />
                    {application.job.active === false && (
                      <small className="table-note">Job closed</small>
                    )}
                  </td>
                  <td>{new Date(application.appliedAt).toLocaleDateString()}</td>
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
