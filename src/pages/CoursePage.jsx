import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/course.css";
import {
  subscribeToCourseTasks,
  addTask,
  updateTask,
  toggleTaskStatus,
  deleteTask,
} from "../firebase/taskService";

function CoursePage() {
  const { courseId } = useParams();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  // filters
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");

  // edit mode
  const [editingTaskId, setEditingTaskId] = useState(null);

  useEffect(() => {
    if (!courseId) return;

    const unsubscribe = subscribeToCourseTasks(courseId, (data) => {
      setTasks(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [courseId]);

  async function handleAddTask(e) {
    e.preventDefault();
    if (!title.trim()) return;

    await addTask(courseId, {
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || null,
      assignedTo: assignedTo.trim(),
    });

    // reset form
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setDueDate("");
    setAssignedTo("");
  }

  function handleStartEdit(task) {
    setEditingTaskId(task.id);
    setTitle(task.title || "");
    setDescription(task.description || "");
    setPriority(task.priority || "Medium");
    setAssignedTo(task.assignedTo || "");
    setDueDate(
      task.dueDate && task.dueDate.toDate
        ? task.dueDate.toDate().toISOString().slice(0, 10)
        : ""
    );
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingTaskId) return;

    const updates = {
      title: title.trim(),
      description: description.trim(),
      priority,
      assignedTo: assignedTo.trim(),
      dueDate: dueDate ? new Date(dueDate) : null,
    };

    await updateTask(courseId, editingTaskId, updates);

    setEditingTaskId(null);
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setDueDate("");
    setAssignedTo("");
  }

  // Get unique assignees for filter
  const uniqueAssignees = [...new Set(tasks.map(task => task.assignedTo).filter(Boolean))];

  function filteredAndSortedTasks() {
    let result = [...tasks];

    // filter by status
    if (filterStatus !== "all") {
      result = result.filter((t) => t.status === filterStatus);
    }

    // filter by priority
    if (filterPriority !== "all") {
      result = result.filter((t) => t.priority === filterPriority);
    }

    // filter by assignee
    if (filterAssignee !== "all") {
      result = result.filter(
        (t) =>
          (t.assignedTo || "").toLowerCase() === filterAssignee.toLowerCase()
      );
    }

    // sorting
    result.sort((a, b) => {
      if (sortBy === "dueDate") {
        const ad = a.dueDate?.toDate ? a.dueDate.toDate().getTime() : Infinity;
        const bd = b.dueDate?.toDate ? b.dueDate.toDate().getTime() : Infinity;
        return ad - bd;
      } else {
        // createdAt
        const ac = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bc = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return ac - bc;
      }
    });

    return result;
  }

  const filteredTasks = filteredAndSortedTasks();

  return (
    <div className="course-page">
      <div className="course-header">
        <h2>
          Course Tasks
          <span className="course-id">{courseId}</span>
        </h2>
        
        <div className="course-stats">
          <div className="stat-badge">
            <span>Total:</span>
            <strong>{tasks.length}</strong>
          </div>
          <div className="stat-badge">
            <span>Pending:</span>
            <strong>{tasks.filter(t => t.status !== 'done').length}</strong>
          </div>
          <div className="stat-badge">
            <span>Done:</span>
            <strong>{tasks.filter(t => t.status === 'done').length}</strong>
          </div>
        </div>
      </div>

      {/* Add/Edit Task Form */}
      <div className="task-form-container">
        <h3>{editingTaskId ? "Edit Task" : "Add New Task"}</h3>
        <form onSubmit={editingTaskId ? handleSaveEdit : handleAddTask}>
          <div className="task-form-grid">
            <div className="task-form-input">
              <label htmlFor="title">Task Title *</label>
              <input
                type="text"
                id="title"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="task-form-input">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                placeholder="Optional details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="task-form-input">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="task-form-input">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="task-form-input">
              <label htmlFor="assignedTo">Assigned To</label>
              <input
                type="text"
                id="assignedTo"
                placeholder="Name or email"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />
            </div>
          </div>

          <div className="task-form-actions">
            <button type="submit">
              {editingTaskId ? "Save Changes" : "Add Task"}
            </button>
            {editingTaskId && (
              <button
                type="button"
                onClick={() => {
                  setEditingTaskId(null);
                  setTitle("");
                  setDescription("");
                  setPriority("Medium");
                  setDueDate("");
                  setAssignedTo("");
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <h4>Filter & Sort Tasks</h4>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="filterStatus">Status</label>
            <select
              id="filterStatus"
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="done">Completed</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filterPriority">Priority</label>
            <select
              id="filterPriority"
              className="filter-select"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filterAssignee">Assigned To</label>
            <select
              id="filterAssignee"
              className="filter-select"
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
            >
              <option value="all">Everyone</option>
              {uniqueAssignees.map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sortBy">Sort By</label>
            <select
              id="sortBy"
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="dueDate">Due Date</option>
              <option value="createdAt">Created Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="tasks-section">
        <h4>
          Tasks ({filteredTasks.length})
          {filterStatus !== 'all' && ` • ${filterStatus}`}
          {filterPriority !== 'all' && ` • ${filterPriority}`}
        </h4>

        {loading ? (
          <div className="tasks-empty">
            <p>Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="tasks-empty">
            <p>No tasks found</p>
            <p>Try changing your filters or add a new task</p>
          </div>
        ) : (
          <ul className="tasks-list">
            {filteredTasks.map((task) => (
              <li key={task.id} className={task.status === "done" ? "done" : ""}>
                <div className={`task-priority ${task.priority?.toLowerCase() || 'medium'}`}></div>
                <div className="task-content">
                  <div className="task-header">
                    <div className="task-title-section">
                      <h3 className="task-title">{task.title}</h3>
                      <span className={`task-priority-badge ${task.priority?.toLowerCase() || 'medium'}`}>
                        {task.priority || 'Medium'}
                      </span>
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                  
                  <div className="task-meta">
                    {task.dueDate?.toDate && (
                      <div className="task-meta-item task-due">
                        Due: {task.dueDate.toDate().toLocaleDateString()}
                      </div>
                    )}
                    
                    {task.assignedTo && (
                      <div className="task-meta-item task-assignee">
                        {task.assignedTo}
                      </div>
                    )}
                    
                    <div className={`task-meta-item task-status ${task.status || 'pending'}`}>
                      {task.status === 'done' ? 'Completed' : 'Pending'}
                    </div>
                  </div>
                  
                  <div className="task-actions">
                    <button
                      className="task-action-btn"
                      onClick={() =>
                        toggleTaskStatus(courseId, task.id, task.status || "pending")
                      }
                    >
                      {task.status === "done" ? "Mark Pending" : "Mark Done"}
                    </button>
                    <button 
                      className="task-action-btn"
                      onClick={() => handleStartEdit(task)}
                    >
                      Edit
                    </button>
                    <button 
                      className="task-action-btn"
                      onClick={() => deleteTask(courseId, task.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CoursePage;