import { Link, useLocation, Outlet } from "react-router-dom";
import { IoMdToday } from "react-icons/io"; 
import { FaCalendarAlt } from "react-icons/fa";
import { FaRegCalendar } from "react-icons/fa";

const AppLayout = () => {
  const location = useLocation();

  const menu = [
    { label: "Today", path: "/today", icon: <FaRegCalendar className="text-xl" /> },
    { label: "Upcoming", path: "/upcoming", icon: <FaCalendarAlt className="text-xl" /> },
  ];
  

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-6 space-y-4">
        <div className="flex items-center space-x-2 font-bold text-xl mb-4">
          <IoMdToday className="text-xl" /> {/* ← changed here */}
          <span>Task Planner</span>
        </div>
        {menu.map((item) => (
  <Link
    key={item.path}
    to={item.path}
    className={`flex items-center space-x-2 py-2 px-3 rounded hover:bg-gray-200 ${
      location.pathname === item.path ? "bg-gray-300 font-semibold" : ""
    }`}
  >
    {item.icon}
    <span>{item.label}</span>
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

