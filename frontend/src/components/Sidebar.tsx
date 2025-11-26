import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-60 h-screen bg-gray-900 text-white p-4 fixed">
      <h2 className="text-2xl font-bold mb-8">⚡ Dashboard</h2>

      <nav className="flex flex-col gap-4">
        <Link to="/dashboard" className="hover:text-yellow-300">
          Dashboard
        </Link>
        <Link to="/users" className="hover:text-yellow-300">
          Users
        </Link>
        <Link to="/devices" className="hover:text-yellow-300">
          Devices
        </Link>
        <Link to="/notifications" className="hover:text-yellow-300">
          Notifications
        </Link>
      </nav>
    </div>
  );
}
