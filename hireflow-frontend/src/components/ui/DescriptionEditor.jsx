import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const toolbarOptions = [
  ["bold", "italic", "underline"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ header: [2, 3, false] }],
  ["clean"],
];

export default function DescriptionEditor({ value, onChange }) {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const latestValueRef = useRef(value || "");

  useEffect(() => {
    latestValueRef.current = value || "";
  }, [value]);

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    const quill = new Quill(containerRef.current, {
      modules: { toolbar: toolbarOptions },
      placeholder: "Write a clear role summary, responsibilities, requirements, and benefits.",
      theme: "snow",
    });

    quill.root.innerHTML = latestValueRef.current;
    quill.on("text-change", () => {
      const html = quill.root.innerHTML;
      onChange(html === "<p><br></p>" ? "" : html);
    });

    quillRef.current = quill;
  }, [onChange]);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill || quill.root.innerHTML === value) return;

    const selection = quill.getSelection();
    quill.root.innerHTML = value || "";
    if (selection) {
      quill.setSelection(selection);
    }
  }, [value]);

  const insertTemplate = () => {
    const template = `
      <h2>Overview</h2>
      <p>Write a short summary of the role.</p>
      <h2>Responsibilities</h2>
      <ul><li>Describe the core responsibility.</li><li>Add another responsibility.</li></ul>
      <h2>Requirements</h2>
      <ul><li>Add the required experience or skill.</li><li>Add another requirement.</li></ul>
      <h2>Benefits</h2>
      <ul><li>Competitive compensation</li><li>Growth opportunities</li></ul>
    `;
    quillRef.current.root.innerHTML = template;
    onChange(template);
  };

  return (
    <label className="description-editor">
      Description
      <div className="editor-helper-row">
        <button type="button" className="button button-secondary" onClick={insertTemplate}>
          Insert role template
        </button>
      </div>
      <div className="quill-shell">
        <div ref={containerRef} />
      </div>
    </label>
  );
}
