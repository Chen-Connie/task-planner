import { useState, useEffect } from "react";
import { FiSearch, FiEdit, FiTrash2 } from "react-icons/fi";
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

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchAllTasks();
    }
  }, [currentUser]);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, allTasks]);

  const fetchAllTasks = () => {
    if (!currentUser) return;

    setLoading(true);
    
    // Create a query to get only the current user's tasks
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(tasksQuery, (querySnapshot) => {
      const tasksData = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({
          _id: doc.id,
          ...doc.data()
        });
      });
      
      setAllTasks(tasksData);
      setLoading(false);
    });

    // Return cleanup function
    return () => unsubscribe();
  };

  const performSearch = () => {
    // Simple search through title, description, and category
    const query = searchQuery.toLowerCase().trim();
    const results = allTasks.filter(task => 
      (task.title && task.title.toLowerCase().includes(query)) ||
      (task.description && task.description.toLowerCase().includes(query)) ||
      (task.category && task.category.toLowerCase().includes(query))
    );
    
    setSearchResults(results);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
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
    navigate(`/today?edit=${task._id}`);
  };

  // Format date for display if needed
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto text-center py-10">
        <p>Please log in to search your tasks.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for tasks by title, description or category..."
            className="w-full p-3 pl-10 border rounded-full text-lg"
          />
          <FiSearch className="absolute left-3 top-4 text-gray-400" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading tasks...</div>
      ) : searchQuery.trim() ? (
        <>
          <div className="mb-4 text-sm text-gray-500">
            {searchResults.length} results for "{searchQuery}"
          </div>

          {searchResults.length > 0 ? (
            <ul className="space-y-4 mb-6">
              {searchResults.map((task) => (
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
                          {formatDate(task.datetime)}
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
          ) : (
            <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm p-6">
              No tasks found matching "{searchQuery}". Try a different search term.
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm p-6">
          Enter a search term to find tasks.
          {allTasks.length > 0 && (
            <p className="mt-2 text-sm">You have {allTasks.length} total tasks to search through.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
