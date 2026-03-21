import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/drills", label: "Drill Library" },
  { to: "/history", label: "History" },
  { to: "/analytics", label: "Analytics" },
];

export default function Nav() {
  return (
    <nav className="flex flex-wrap gap-2 border-b border-slate-200 bg-white px-4 py-3">
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-emerald-600 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
