import { useEffect, useState } from "react";
import axios from "axios";

const formatDateForInput = (isoString) => {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", category: "", datetime: "", priority: "Medium" });
  const [filter, setFilter] = useState({ category: "", date: "" });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await axios.get("https://task-planner-14lq.onrender.com/tasks");
    setTasks(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("https://task-planner-14lq.onrender.com/tasks", form);
    setForm({ title: "", category: "", datetime: "", priority: "Medium" });
    fetchTasks();
  };

  const handleEdit = (task) => {
    setForm({
      title: task.title,
      category: task.category,
      datetime: formatDateForInput(task.datetime),
      priority: task.priority || "Medium"
    });
  };

  const handleDelete = async (id) => {
    await axios.delete(`https://task-planner-14lq.onrender.com/tasks/${id}`);
    fetchTasks();
  };

  const handleToggleComplete = async (id, newStatus) => {
    await axios.put(`https://task-planner-14lq.onrender.com/tasks/${id}`, { completed: newStatus });
    fetchTasks();
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesCategory = filter.category ? task.category === filter.category : true;
    const matchesDate = filter.date ? task.datetime.startsWith(filter.date) : true;
    return matchesCategory && matchesDate;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">🗓️ Task Planner</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md mb-8 max-w-xl mx-auto space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Task Title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="category"
          placeholder="Category (e.g. Work, School)"
          value={form.category}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="datetime-local"
          name="datetime"
          value={form.datetime}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Add Task
        </button>
      </form>

      <div className="max-w-xl mx-auto mb-4 flex space-x-2">
        <input
          type="text"
          name="category"
          placeholder="Filter by category"
          value={filter.category}
          onChange={handleFilterChange}
          className="w-1/2 p-2 border rounded"
        />
        <input
          type="date"
          name="date"
          value={filter.date}
          onChange={handleFilterChange}
          className="w-1/2 p-2 border rounded"
        />
      </div>

      <ul className="space-y-4 max-w-xl mx-auto">
        {filteredTasks.map((task) => (
          <li key={task._id} className="bg-white shadow-md p-4 rounded">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleComplete(task._id, !task.completed)}
                  className="mr-2"
                />
                <div>
                  <div className={`font-semibold text-lg ${task.completed ? "line-through text-gray-400" : ""}`}>{task.title}</div>
                  <div className="text-gray-600">{task.category}</div>
                  <div className="text-sm text-gray-500">{new Date(task.datetime).toLocaleString()}</div>
                  <div className="text-sm text-indigo-500">Priority: {task.priority}</div>
                </div>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
