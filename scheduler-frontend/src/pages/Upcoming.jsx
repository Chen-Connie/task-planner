import { useEffect, useState } from "react";
import axios from "axios";
import { FiCalendar, FiEdit, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Upcoming() {
  const [tasks, setTasks] = useState([]);
  const [futureTasks, setFutureTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://task-planner-14lq.onrender.com/tasks");
      setTasks(res.data);
      
      // Filter tasks with future dates
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of today
      
      const filtered = res.data.filter(task => {
        if (!task.datetime) return false;
        const taskDate = new Date(task.datetime);
        return taskDate > today;
      });
      
      // Sort by date (closest first)
      filtered.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
      
      setFutureTasks(filtered);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (task) => {
    try {
      const updatedTask = { 
        ...task, 
        completed: !task.completed,
        title: task.title,
        description: task.description || "",
        category: task.category || "",
        datetime: task.datetime || "",
        priority: task.priority || "Medium"
      };

      await axios.put(`https://task-planner-14lq.onrender.com/tasks/${task._id}`, updatedTask);
      
      setFutureTasks(futureTasks.map(t => {
        if (t._id === task._id) {
          return { ...t, completed: !t.completed };
        }
        return t;
      }));
      fetchTasks();
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
        await axios.delete(`https://task-planner-14lq.onrender.com/tasks/${taskId}`);

        setFutureTasks(futureTasks.filter(task => task._id !== taskId));
        fetchTasks();
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete task. Please try again.");
      }
    }
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Upcoming</h2>
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
          {dateGroups.map(dateKey => (
            <div key={dateKey} className="mb-4">
              <h3 className="text-md font-medium text-gray-500 mb-2">
                {new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <ul className="space-y-2">
                {groupedTasks[dateKey].map((task) => (
                  <li key={task._id} className="flex items-start gap-2 p-3 bg-white rounded-lg shadow-sm hover:shadow transition">
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
                      <div className="flex justify-between">
                        <div className="text-sm text-gray-400">
                          {task.category || "Inbox"}
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatDate(task.datetime).split(',')[1]} {/* Show only time */}
                        </div>
                      </div>
                      {task.description && (
                        <div className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-500'}`}>
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
                        className="text-gray-400 hover:text-blue-500"
                      >
                        <FiEdit />
                      </button>
                      <button 
                        onClick={() => handleDelete(task._id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
//  export default Upcoming;
