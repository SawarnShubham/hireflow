export default function RichTextView({ html }) {
  return (
    <div
      className="rich-text-view"
      dangerouslySetInnerHTML={{ __html: html || "" }}
    />
  );
}
