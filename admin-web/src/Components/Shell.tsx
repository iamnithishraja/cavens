import { type ReactNode, useState } from "react";
import logo from "../assets/adaptive-icon.png";

type NavItem = {
  key: string;
  name: string;
  href: string;
  comingSoon?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", name: "Dashboard", href: "#", comingSoon: true },
  { key: "approve", name: "Pending Clubs", href: "/approve" },
  { key: "approved", name: "Approved Clubs", href: "#", comingSoon: true },
];

export function AdminShell({ children, active }: { children: ReactNode; active?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-[var(--bg)] text-[var(--text-primary)] grid" style={{ gridTemplateColumns: "260px 1fr" }}>
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex bg-surface flex-col border-r border-brand">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-brand">
          <img src={logo} alt="caVen" className="h-6 w-6" />
          <span className="font-semibold">caVen Admin</span>
        </div>
        <nav className="p-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.key;
            return (
              <a
                key={item.key}
                href={item.href}
                className={[
                  "flex items-center gap-2 px-3 py-2 rounded-lg border",
                  isActive ? "bg-surface-elevated border-brand" : "border-transparent hover:border-brand",
                  item.comingSoon ? "opacity-60 cursor-not-allowed" : "",
                ].join(" ")}
                onClick={(e) => {
                  if (item.comingSoon) e.preventDefault();
                }}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-blue)]" />
                <span className="text-sm">{item.name}{item.comingSoon ? " (soon)" : ""}</span>
              </a>
            );
          })}
        </nav>
        <div className="mt-auto p-3 text-[var(--text-secondary)] text-xs border-t border-brand">
          © {new Date().getFullYear()} caVen
        </div>
      </aside>

      {/* Main column */}
      <div className="grid" style={{ gridTemplateRows: "56px 1fr" }}>
        {/* Topbar */}
        <header className="px-3 md:px-4 border-b border-brand bg-surface flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Mobile: sidebar toggle */}
            <button
              className="md:hidden px-3 py-2 rounded-lg btn-muted"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              ≡
            </button>

          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { localStorage.removeItem("admin_token"); window.location.href = "/"; }}
              className="px-3 py-2 rounded-xl btn-muted font-semibold cursor-pointer hover:opacity-90 active:translate-y-px"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content area */}
        <main className="p-4 md:p-6 overflow-auto no-scrollbar">
          {children}
        </main>
      </div>

      {/* Sidebar - mobile overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[80%] max-w-[280px] bg-surface border-r border-brand flex flex-col">
            <div className="flex items-center gap-2 px-4 py-4 border-b border-brand">
              <img src={logo} alt="caVen" className="h-6 w-6" />
              <span className="font-semibold">caVen Admin</span>
            </div>
            <nav className="p-2 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = active === item.key;
                return (
                  <a
                    key={item.key}
                    href={item.href}
                    className={[
                      "flex items-center gap-2 px-3 py-2 rounded-lg border",
                      isActive ? "bg-surface-elevated border-brand" : "border-transparent hover:border-brand",
                      item.comingSoon ? "opacity-60 cursor-not-allowed" : "",
                    ].join(" ")}
                    onClick={(e) => {
                      if (item.comingSoon) e.preventDefault();
                      setSidebarOpen(false);
                    }}
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-blue)]" />
                    <span className="text-sm">{item.name}{item.comingSoon ? " (soon)" : ""}</span>
                  </a>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}

export default AdminShell;


