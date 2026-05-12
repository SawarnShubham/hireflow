const statusLabels = {
  APPLIED: "Applied",
  INTERVIEW_SCHEDULED: "Interview",
  REJECTED: "Rejected",
  HIRED: "Hired",
  CLOSED: "Closed",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status?.toLowerCase()}`}>
      {statusLabels[status] || status || "Unknown"}
    </span>
  );
}
