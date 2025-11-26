export default function NotificationBell() {
  return (
    <button className="relative">
      <span className="text-2xl">🔔</span>
      <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
    </button>
  );
}
