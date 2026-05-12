export default function EmptyState({ title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">HF</div>
      <h2>{title}</h2>
      <p>{message}</p>
      {action}
    </div>
  );
}
