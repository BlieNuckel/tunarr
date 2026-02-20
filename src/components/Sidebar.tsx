import { NavLink } from "react-router-dom";

const DiscoverIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M3 4h14v3H3zM3 9h14v3H3zM3 14h14v3H3z" />
  </svg>
);

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M2 2h12v12H2z" />
    <path d="M12 12l6 6-2 2-6-6z" />
  </svg>
);

const StatusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M2 14h3v4H2zM7 9h3v9H7zM12 4h3v14h-3z" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M8 0h4v6H8zM0 8h6v4H0zM8 14h4v6H8zM14 8h6v4h-6zM7 7h6v6H7z" />
  </svg>
);

const links: Array<{ to: string; label: string; icon: React.ReactNode }> = [
  { to: "/", label: "Discover", icon: <DiscoverIcon /> },
  { to: "/search", label: "Search", icon: <SearchIcon /> },
  { to: "/status", label: "Status", icon: <StatusIcon /> },
  { to: "/settings", label: "Settings", icon: <SettingsIcon /> },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r-4 border-black flex flex-col">
      <div className="p-6 border-b-4 border-black">
        <NavLink to="/" className="flex items-center gap-3 group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className="w-10 h-10 flex-shrink-0"
          >
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="#FCD34D"
              stroke="black"
              strokeWidth="2"
            />
            <circle
              cx="16"
              cy="16"
              r="10"
              fill="none"
              stroke="black"
              strokeWidth="1.5"
            />
            <circle
              cx="16"
              cy="16"
              r="6"
              fill="#F472B6"
              stroke="black"
              strokeWidth="2"
            />
            <circle
              cx="16"
              cy="16"
              r="2"
              fill="white"
              stroke="black"
              strokeWidth="1.5"
            />
          </svg>
          <span className="text-2xl font-bold text-gray-900 group-hover:text-amber-500 transition-colors">
            Tunearr
          </span>
        </NavLink>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-base font-bold transition-all border-2 ${
                    isActive
                      ? "bg-amber-300 text-black border-black shadow-cartoon-sm"
                      : "text-gray-700 border-transparent hover:bg-amber-50 hover:border-black hover:text-gray-900"
                  }`
                }
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
