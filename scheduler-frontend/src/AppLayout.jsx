import { Link, useLocation, Outlet } from "react-router-dom";

const AppLayout = () => {
  const location = useLocation();

  const menu = [
    { label: "Today", path: "/today" },
    { label: "Search", path: "/search" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-6 space-y-4">
        <div className="font-bold text-xl mb-4">📋 Task Planner</div>
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block py-2 px-3 rounded hover:bg-gray-200 ${
              location.pathname === item.path ? "bg-gray-300 font-semibold" : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </aside>

      {/* Page content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
