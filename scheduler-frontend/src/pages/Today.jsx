import { useEffect, useState } from "react";
import axios from "axios";
import { FiCalendar, FiFilter, FiCheckCircle, FiCircle, FiTrash2, FiEdit } from "react-icons/fi";

const formatDateForInput = (isoString) => {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
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

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, selectedCategory, selectedPriority]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("https://task-planner-14lq.onrender.com/tasks");
      setTasks(res.data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(res.data.map(task => task.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(task => task.category === selectedCategory);
    }
    
    // Apply priority filter
    if (selectedPriority) {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }
    
    // Sort by completion status and priority
    filtered.sort((a, b) => {
      // First by completion status
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // Then by priority
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
    
    if (editingTask) {
      // Update existing task
      await axios.put(`https://task-planner-14lq.onrender.com/tasks/${editingTask._id}`, form);
      setEditingTask(null);
    } else {
      // Create new task
      await axios.post("https://task-planner-14lq.onrender.com/tasks", form);
    }
    
    setForm({ title: "", description: "", category: "", datetime: "", priority: "Medium", completed: false });
    setShowForm(false);
    fetchTasks();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(null);
    setForm({ title: "", description: "", category: "", datetime: "", priority: "Medium", completed: false });
  };

  const handleDelete = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await axios.delete(`https://task-planner-14lq.onrender.com/tasks/${taskId}`);
      fetchTasks();
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
    const updatedTask = { ...task, completed: !task.completed };
    await axios.put(`https://task-planner-14lq.onrender.com/tasks/${task._id}`, updatedTask);
    fetchTasks();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Today</h2>
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

      <ul className="space-y-4 mb-6">
        {filteredTasks.map((task) => (
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
              <div className="flex justify-between">
                <div className="text-sm text-gray-400">
                  {task.category || "Inbox"}
                </div>
                {task.datetime && (
                  <div className="text-sm text-gray-400">
                    {new Date(task.datetime).toLocaleString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
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
        ))}
      </ul>

      {filteredTasks.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No tasks found. {selectedCategory || selectedPriority ? "Try changing your filters or " : ""}
          Add a new task to get started.
        </div>
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
