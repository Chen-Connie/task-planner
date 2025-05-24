import { useEffect, useState } from "react";
import { FiCalendar, FiFilter, FiCheckCircle, FiCircle, FiTrash2, FiEdit, FiClock } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';

const formatDateForInput = (isoString) => {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
};

// Enhanced date formatting function
const formatTaskDate = (dateString) => {
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
  
  if (diffDays === 0) {
    return { label: 'Today', time, color: 'text-blue-600', bgColor: 'bg-blue-50' };
  } else if (diffDays === 1) {
    return { label: 'Tomorrow', time, color: 'text-green-600', bgColor: 'bg-green-50' };
  } else if (diffDays === -1) {
    return { label: 'Yesterday', time, color: 'text-red-600', bgColor: 'bg-red-50' };
  } else if (diffDays > 1 && diffDays <= 7) {
    const dayName = date.toLocaleDateString(undefined, { weekday: 'long' });
    return { label: dayName, time, color: 'text-green-600', bgColor: 'bg-green-50' };
  } else if (diffDays < -1 && diffDays >= -7) {
    const dayName = date.toLocaleDateString(undefined, { weekday: 'long' });
    return { label: `Last ${dayName}`, time, color: 'text-red-600', bgColor: 'bg-red-50' };
  } else {
    const fullDate = date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
    return { 
      label: fullDate, 
      time, 
      color: diffDays > 0 ? 'text-gray-600' : 'text-gray-500', 
      bgColor: diffDays > 0 ? 'bg-gray-50' : 'bg-gray-100' 
    };
  }
};

export default function Today() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    datetime: "",
    priority: "Medium",
    completed: false
  });
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
    }
  }, [currentUser]);

  useEffect(() => {
    filterTasks();
  }, [tasks, selectedCategory, selectedPriority]);

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
      
      const uniqueCategories = [...new Set(tasksData.map(task => task.category).filter(Boolean))];
      setCategories(uniqueCategories);
      
      setLoading(false);
    });

    return () => unsubscribe();
  };

  const filterTasks = () => {
    let filtered = [...tasks];
    
    if (selectedCategory) {
      filtered = filtered.filter(task => task.category === selectedCategory);
    }
    
    if (selectedPriority) {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }
    
    filtered.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      const priorityRank = { High: 1, Medium: 2, Low: 3 };
      return priorityRank[a.priority] - priorityRank[b.priority];
    });
    
    setFilteredTasks(filtered);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('You must be logged in to create tasks');
      return;
    }

    try {
      const taskData = {
        ...form,
        userId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (editingTask) {
        const taskRef = doc(db, 'tasks', editingTask._id);
        await updateDoc(taskRef, {
          ...taskData,
          updatedAt: new Date()
        });
        setEditingTask(null);
      } else {
        await addDoc(collection(db, 'tasks'), taskData);
      }
      
      setForm({ title: "", description: "", category: "", datetime: "", priority: "Medium", completed: false });
      setShowForm(false);
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Failed to save task. Please try again.");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(null);
    setForm({ title: "", description: "", category: "", datetime: "", priority: "Medium", completed: false });
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

  const handleEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      category: task.category || "",
      datetime: task.datetime ? formatDateForInput(task.datetime) : "",
      priority: task.priority || "Medium",
      completed: task.completed || false
    });
    setShowForm(true);
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

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto text-center py-10">
        <p>Please log in to view your tasks.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
       
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <FiFilter />
            Filter
          </button>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <FiCalendar />
            {filteredTasks.length} tasks
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex flex-wrap gap-3">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border rounded text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select 
              value={selectedPriority} 
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="p-2 border rounded text-sm"
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            
            <button 
              onClick={() => {
                setSelectedCategory("");
                setSelectedPriority("");
              }}
              className="text-xs bg-gray-200 text-gray-600 px-3 py-2 rounded hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">Loading tasks...</div>
      ) : (
        <>
          <ul className="space-y-4 mb-6">
            {filteredTasks.map((task) => {
              const dateInfo = formatTaskDate(task.datetime);
              
              return (
                <li key={task._id} className={`flex items-start gap-2 p-3 bg-white rounded-lg shadow-sm hover:shadow transition ${task.completed ? 'bg-gray-50 opacity-75' : ''}`}>
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
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-sm text-gray-400">
                        {task.category || "Inbox"}
                      </div>
                      
                      {dateInfo && (
                        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${dateInfo.bgColor} ${dateInfo.color}`}>
                          <FiClock size={12} />
                          <span>{dateInfo.label} {dateInfo.time}</span>
                        </div>
                      )}
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
                      {task.priority}
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
              );
            })}
          </ul>

          {filteredTasks.length === 0 && !loading && (
            <div className="text-center py-10 text-gray-500">
              No tasks found. {selectedCategory || selectedPriority ? "Try changing your filters or " : ""}
              Add a new task to get started.
            </div>
          )}
        </>
      )}

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white border rounded-lg shadow-md p-4 space-y-3"
        >
          <input
            type="text"
            name="title"
            placeholder="Task title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded text-lg font-medium"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <div className="flex flex-wrap gap-2">
            <input
              type="datetime-local"
              name="datetime"
              value={form.datetime}
              onChange={handleChange}
              className="p-2 border rounded"
            />
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="p-2 border rounded"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={form.category}
              onChange={handleChange}
              className="p-2 border rounded"
              list="categories"
            />
            <datalist id="categories">
              {categories.map(category => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500"
            >
              {editingTask ? "Update task" : "Add task"}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full text-left px-4 py-3 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition"
        >
          + Add task
        </button>
      )}
    </div>
  );
}