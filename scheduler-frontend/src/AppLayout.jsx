import { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { IoMdToday } from "react-icons/io"; 
import { FaCalendarAlt, FaRegCalendar, FaUserCircle } from "react-icons/fa";
import { FiSearch, FiPieChart, FiLogOut, FiChevronDown } from "react-icons/fi";
import { useAuth } from "./contexts/AuthContext";

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const menu = [
    { label: "Today", path: "/today", icon: <FaRegCalendar className="text-xl" /> },
    { label: "Upcoming", path: "/upcoming", icon: <FaCalendarAlt className="text-xl" /> },
    { label: "Search", path: "/search", icon: <FiSearch className="text-xl" /> },
    { label: "Dashboard", path: "/dashboard", icon: <FiPieChart className="text-xl" /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 font-bold text-xl mb-6">
          <IoMdToday className="text-red-500 text-2xl" />
          <span>Task Planner</span>
        </div>
        
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 py-2 px-4 rounded-lg transition hover:bg-gray-100 ${
              location.pathname === item.path 
                ? "bg-red-50 text-red-500 font-semibold" 
                : "text-gray-700"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </aside>

      {/* Main content with header */}
      <div className="flex-1 flex flex-col">
        {/* Header with user profile */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            {menu.find(item => item.path === location.pathname)?.label || "Task Planner"}
          </h1>
          
          <div className="relative">
            <button 
              onClick={toggleDropdown}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <FaUserCircle className="text-xl text-gray-600" />
              <span>{currentUser?.displayName || currentUser?.email}</span>
              <FiChevronDown className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-2">
                    <FiLogOut />
                    <span>Sign Out</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;