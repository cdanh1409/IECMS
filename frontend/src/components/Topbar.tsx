import NotificationBell from "./NotificationBell";

export default function Topbar() {
  return (
    <div className="h-16 bg-white shadow flex justify-between items-center px-6 ml-60">
      <h1 className="text-xl font-semibold">Electrical Dashboard</h1>
      <NotificationBell />
    </div>
  );
}
