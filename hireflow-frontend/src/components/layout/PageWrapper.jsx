import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function PageWrapper({ children }) {
  return (
    <div className="app-shell">
      <Navbar />

      <div className="app-body">
        <Sidebar />

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
