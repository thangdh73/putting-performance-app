import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import DrillLibrary from "./pages/DrillLibrary";
import DrillDetail from "./pages/DrillDetail";
import SessionEntry from "./pages/SessionEntry";
import SessionSummary from "./pages/SessionSummary";
import History from "./pages/History";
import Analytics from "./pages/Analytics";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="drills" element={<DrillLibrary />} />
        <Route path="drills/:id" element={<DrillDetail />} />
        <Route path="sessions/:sessionId" element={<SessionEntry />} />
        <Route path="sessions/:sessionId/summary" element={<SessionSummary />} />
        <Route path="history" element={<History />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  );
}
