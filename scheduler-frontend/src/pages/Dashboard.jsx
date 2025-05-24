import { useState, useEffect } from 'react';
import { FiPieChart, FiCheckCircle, FiClock, FiTag } from 'react-icons/fi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from "../contexts/AuthContext";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    categories: [],
    priorities: [],
    completionRate: 0,
  });
  const { currentUser } = useAuth();

  // Colors for charts
  const COLORS = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28', '#9370DB', '#FF6B6B', '#5DBF9A'];
  const PRIORITY_COLORS = {
    'High': '#FF6B6B',
    'Medium': '#FFBB28',
    'Low': '#5DBF9A',
  };

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
    }
  }, [currentUser]);

  useEffect(() => {
    calculateStats();
  }, [tasks]);

  const fetchTasks = () => {
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
      
      setTasks(tasksData);
      setLoading(false);
    });

    // Return cleanup function
    return () => unsubscribe();
  };

  const calculateStats = () => {
    if (tasks.length === 0) {
      setStats({
        total: 0,
        completed: 0,
        pending: 0,
        categories: [],
        priorities: [],
        completionRate: 0,
        categoryBreakdown: [],
        tasksByDay: []
      });
      return;
    }

    // Basic stats
    const completed = tasks.filter(task => task.completed).length;
    const total = tasks.length;
    const pending = total - completed;
    const completionRate = Math.round((completed / total) * 100);

    // Group by category
    const categoryCount = {};
    tasks.forEach(task => {
      const category = task.category || 'Inbox';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const categories = Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);

    // Group by priority
    const priorityCount = {
      'High': 0,
      'Medium': 0,
      'Low': 0
    };

    tasks.forEach(task => {
      const priority = task.priority || 'Medium';
      priorityCount[priority] = (priorityCount[priority] || 0) + 1;
    });

    const priorities = Object.entries(priorityCount).map(([name, value]) => ({
      name,
      value
    }));

    // Completed vs pending by category
    const categoryStatus = {};
    tasks.forEach(task => {
      const category = task.category || 'Inbox';
      if (!categoryStatus[category]) {
        categoryStatus[category] = { name: category, completed: 0, pending: 0 };
      }
      if (task.completed) {
        categoryStatus[category].completed += 1;
      } else {
        categoryStatus[category].pending += 1;
      }
    });

    const categoryBreakdown = Object.values(categoryStatus)
      .sort((a, b) => (b.completed + b.pending) - (a.completed + a.pending))
      .slice(0, 5); // Top 5 categories

    // Tasks over time (last 7 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();
    
    const tasksByDay = last7Days.map(date => {
      const dateString = date.toISOString().split('T')[0];
      const dayTasks = tasks.filter(task => {
        if (!task.datetime) return false;
        const taskDate = new Date(task.datetime);
        return taskDate.toISOString().split('T')[0] === dateString;
      });
      
      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        total: dayTasks.length,
        completed: dayTasks.filter(t => t.completed).length
      };
    });

    setStats({
      total,
      completed,
      pending,
      categories,
      priorities,
      completionRate,
      categoryBreakdown,
      tasksByDay
    });
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{`${label || payload[0].name}: ${payload[0].value}`}</p>
          {payload[0].payload && payload[0].payload.percent && (
            <p className="text-gray-500">{`${payload[0].payload.percent}%`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Render custom label for pie charts
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="#333"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    ) : null;
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto text-center py-10">
        <p>Please log in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-gray-500">Overview of your task management</p>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading dashboard data...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm p-6">
          No tasks found. Add some tasks to see your dashboard stats.
          <a href="/today" className="block mt-4 text-red-500 hover:underline">
            Go to Today to add tasks
          </a>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                  <FiClock />
                </div>
                <h3 className="font-medium text-gray-600">Total Tasks</h3>
              </div>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 text-green-600 rounded-full">
                  <FiCheckCircle />
                </div>
                <h3 className="font-medium text-gray-600">Completed</h3>
              </div>
              <p className="text-3xl font-bold">{stats.completed}</p>
              <p className="text-sm text-gray-500">{stats.completionRate}% completion rate</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full">
                  <FiTag />
                </div>
                <h3 className="font-medium text-gray-600">Categories</h3>
              </div>
              <p className="text-3xl font-bold">{stats.categories.length}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Tasks by Category */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-600 mb-4">Tasks by Category</h3>
              <div className="h-64">
                {stats.categories.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.categories}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No category data available
                  </div>
                )}
              </div>
            </div>

            {/* Tasks by Priority */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-600 mb-4">Tasks by Priority</h3>
              <div className="h-64">
                {stats.priorities.some(p => p.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.priorities}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.priorities.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={PRIORITY_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No priority data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Completion Status by Category */}
          {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
              <h3 className="font-medium text-gray-600 mb-4">Completion Status by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.categoryBreakdown}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="#00C49F" name="Completed" stackId="a" />
                    <Bar dataKey="pending" fill="#FF8042" name="Pending" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tasks over time (last 7 days) */}
          {stats.tasksByDay && (
            <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
              <h3 className="font-medium text-gray-600 mb-4">Tasks Activity (Last 7 Days)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.tasksByDay}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#8884d8" name="Total Tasks" />
                    <Bar dataKey="completed" fill="#00C49F" name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-gray-500 mt-8">
            <p>
              {currentUser?.displayName ? `${currentUser.displayName}'s` : 'Your'} personal task analytics dashboard
            </p>
          </div>
        </>
      )}
    </div>
  );
}