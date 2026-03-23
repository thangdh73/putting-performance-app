import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/drills", label: "Drill Library" },
  { to: "/history", label: "History" },
  { to: "/analytics", label: "Analytics" },
  { to: "/players", label: "Players" },
];

export default function Nav() {
  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 [-webkit-overflow-scrolling:touch]">
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `inline-flex min-h-[44px] shrink-0 items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors touch-manipulation ${
              isActive
                ? "bg-emerald-600 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200"
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
