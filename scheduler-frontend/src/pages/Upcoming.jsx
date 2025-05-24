import { useEffect, useState } from "react";
import { FiCalendar, FiEdit, FiTrash2, FiClock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  collection, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';

// Enhanced date formatting function
const formatUpcomingDate = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // Calculate difference in days
  const diffTime = taskDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const time = date.toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  if (diffDays === 1) {
    return { label: 'Tomorrow', time, color: 'text-green-700', bgColor: 'bg-green-100', priority: 1 };
  } else if (diffDays <= 7) {
    const dayName = date.toLocaleDateString(undefined, { weekday: 'long' });
    return { label: dayName, time, color: 'text-blue-700', bgColor: 'bg-blue-100', priority: 2 };
  } else if (diffDays <= 30) {
    const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
    const dayNum = date.getDate();
    return { 
      label: `${dayName} ${dayNum}`, 
      time, 
      color: 'text-purple-700', 
      bgColor: 'bg-purple-100',
      priority: 3 
    };
  } else {
    const fullDate = date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
    return { 
      label: fullDate, 
      time, 
      color: 'text-gray-700', 
      bgColor: 'bg-gray-100',
      priority: 4 
    };
  }
};

// Enhanced group header formatting
const formatGroupHeader = (dateKey) => {
  const date = new Date(dateKey);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = taskDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return { text: 'Tomorrow'};
  } else if (diffDays <= 7) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    return { text: dayName};
  } else if (diffDays <= 30) {
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    return { text: dateStr};
  } else {
    const dateStr = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
    return { text: dateStr};
  }
};

export default function Upcoming() {
  const [tasks, setTasks] = useState([]);
  const [futureTasks, setFutureTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
    }
  }, [currentUser]);

  const fetchTasks = () => {
    if (!currentUser) return;

    setLoading(true);
    
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(tasksQuery, (querySnapshot) => {
      const tasksData = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({
          _id: doc.id,
          ...doc.data()
        });
      });
      
      setTasks(tasksData);
      
      // Filter tasks with future dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const filtered = tasksData.filter(task => {
        if (!task.datetime) return false;
        const taskDate = new Date(task.datetime);
        return taskDate > today;
      });
      
      // Sort by date (closest first)
      filtered.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
      
      setFutureTasks(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  };

  const toggleTaskCompletion = async (task) => {
    try {
      const taskRef = doc(db, 'tasks', task._id);
      await updateDoc(taskRef, {
        completed: !task.completed,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task. Please try again.");
    }
  };

  const handleEdit = (task) => {
    navigate(`/today?edit=${task._id}`);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteDoc(doc(db, 'tasks', taskId));
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete task. Please try again.");
      }
    }
  };

  const groupTasksByDate = () => {
    const grouped = {};
    
    futureTasks.forEach(task => {
      if (!task.datetime) return;
      
      const date = new Date(task.datetime);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(task);
    });
    
    return grouped;
  };

  const groupedTasks = groupTasksByDate();
  const dateGroups = Object.keys(groupedTasks).sort();

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto text-center py-10">
        <p>Please log in to view your upcoming tasks.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">

        <div className="text-sm text-gray-500 flex items-center gap-1">
          <FiCalendar />
          {futureTasks.length} upcoming tasks
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading tasks...</div>
      ) : futureTasks.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm p-6">
          No upcoming tasks scheduled. 
          <a href="/today" className="block mt-4 text-red-500 hover:underline">
            Go to Today to add new tasks with future dates
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {dateGroups.map(dateKey => {
            const headerInfo = formatGroupHeader(dateKey);
            
            return (
              <div key={dateKey} className="mb-6">
                {/* Enhanced group header */}
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                  <span className="text-lg">{headerInfo.icon}</span>
                  <h3 className={`text-lg font-semibold ${headerInfo.color}`}>
                    {headerInfo.text}
                  </h3>
                  <span className="text-sm text-gray-400 ml-auto">
                    {groupedTasks[dateKey].length} task{groupedTasks[dateKey].length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <ul className="space-y-3">
                  {groupedTasks[dateKey].map((task) => {
                    const dateInfo = formatUpcomingDate(task.datetime);
                    
                    return (
                      <li key={task._id} className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
                        <input 
                          type="checkbox" 
                          className="mt-1" 
                          checked={task.completed || false}
                          onChange={() => toggleTaskCompletion(task)}
                        />
                        <div className="flex-1">
                          <div className={`font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                            {task.title}
                          </div>
                          
                          {/* Enhanced date and category display */}
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-sm text-gray-500">
                              {task.category || "Inbox"}
                            </div>
                            
                            {dateInfo && (
                              <div className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full ${dateInfo.bgColor} ${dateInfo.color} font-medium`}>
                                <FiClock size={12} />
                                <span>{dateInfo.time}</span>
                              </div>
                            )}
                          </div>
                          
                          {task.description && (
                            <div className={`text-sm mt-2 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                              {task.description}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 items-center">
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            task.priority === 'High' 
                              ? 'bg-red-100 text-red-600' 
                              : task.priority === 'Low'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {task.priority || 'Medium'}
                          </div>
                          <button 
                            onClick={() => handleEdit(task)}
                            className="text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <FiEdit />
                          </button>
                          <button 
                            onClick={() => handleDelete(task._id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {!loading && futureTasks.length > 0 && (
        <a 
          href="/today" 
          className="block text-center mt-8 px-4 py-3 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition"
        >
          Go to Today to add new tasks
        </a>
      )}
    </div>
  );
}