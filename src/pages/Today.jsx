import { useEffect, useState } from "react";
import axios from "axios";
import { FiCalendar } from "react-icons/fi";

const formatDateForInput = (isoString) => {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
};

export default function Today() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    datetime: "",
    priority: "Medium",
  });
  const [showForm, setShowForm] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("https://task-planner-14lq.onrender.com/tasks", form);
    setForm({ title: "", description: "", category: "", datetime: "", priority: "Medium" });
    setShowForm(false);
    fetchTasks();
  };

  const handleCancel = () => {
    setShowForm(false);
    setForm({ title: "", description: "", category: "", datetime: "", priority: "Medium" });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Today</h2>
        <div className="text-sm text-gray-500 flex items-center gap-1">
          <FiCalendar />
          {tasks.length} tasks
        </div>
      </div>

      <ul className="space-y-4 mb-6">
        {tasks.map((task) => (
          <li key={task._id} className="flex items-start gap-2">
            <input type="checkbox" className="mt-1" />
            <div>
              <div className="font-medium">{task.title}</div>
              <div className="text-sm text-gray-400">{task.category || "Inbox"}</div>
            </div>
          </li>
        ))}
      </ul>

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
            />
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
              Add task
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
