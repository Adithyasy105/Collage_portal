// AdminDashboard.jsx
import React, { useState } from "react";
import {
  Users,
  BookOpen,
  BarChart2,
  Settings,
  LayoutDashboard,
  Calendar,
  Award,
} from "lucide-react";

// Import your components for each section.
// You will need to create these components based on the new structure.
// For now, I'll use placeholder components.
import UsersManagement from "./UsersManagement";
import HolidaysManagement from "./HolidaysManagement";
import MasterDataManagement from "./MasterDataManagement";
import ResultsGeneration from "./ResultsGeneration";
import AnalyticsView from "./AnalyticsView";

// Placeholder components for new sections
const DashboardView = () => <div className="text-2xl font-bold">Admin Overview</div>;
const SystemView = () => <div className="text-2xl font-bold">System & Audits</div>;

const TABS = [
  { key: "dashboard", label: "Dashboard", Component: DashboardView, Icon: LayoutDashboard },
  { key: "users", label: "Users", Component: UsersManagement, Icon: Users },
  { key: "academics", label: "Academics", Component: MasterDataManagement, Icon: BookOpen },
  { key: "holidays", label: "Holidays", Component: HolidaysManagement, Icon: Calendar },
  { key: "results", label: "Results", Component: ResultsGeneration, Icon: Award },
  { key: "analytics", label: "Analytics", Component: AnalyticsView, Icon: BarChart2 },
  { key: "system", label: "System", Component: SystemView, Icon: Settings },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const ActiveComponent = TABS.find((tab) => tab.key === activeTab)?.Component;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="h-16 flex items-center justify-center text-xl font-bold border-b border-gray-700">
          Admin Portal
        </div>
        <nav className="flex-grow px-2 py-4">
          <ul className="space-y-2">
            {TABS.map(({ key, label, Icon }) => (
              <li key={key}>
                <button
                  onClick={() => setActiveTab(key)}
                  className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    activeTab === key
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                  type="button"
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-700">
          {/* You can add a logout button or user info here */}
          <p className="text-sm text-gray-400">Logged in as Admin</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm h-16 flex items-center px-6 justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">
            {TABS.find((tab) => tab.key === activeTab)?.label}
          </h1>
          {/* You can add global actions like search or notifications here */}
        </header>
        <main className="flex-grow p-6 overflow-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            {ActiveComponent ? <ActiveComponent /> : <p>Select a tab</p>}
          </div>
        </main>
      </div>
    </div>
  );
}