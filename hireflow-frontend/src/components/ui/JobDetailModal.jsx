import RichTextView from "./RichTextView";

export default function JobDetailModal({ job, onClose, footer }) {
  if (!job) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal-panel" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">{job.company}</p>
            <h2>{job.title}</h2>
            <p className="job-company">{job.location} - {job.job_type}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close details">
            X
          </button>
        </div>

        <div className="modal-meta">
          {job.salary && <span>{job.salary}</span>}
          {(job.tags || []).map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>

        <div className="description-view">
          <RichTextView html={job.description} />
        </div>

        {footer && <div className="modal-footer">{footer}</div>}
      </section>
    </div>
  );
}
