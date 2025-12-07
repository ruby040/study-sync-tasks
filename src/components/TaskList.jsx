import { useState } from "react";
import "./task-list.css";

function TaskList({ 
  tasks = [], 
  onToggleStatus, 
  onEdit, 
  onDelete,
  title = "Tasks",
  loading = false,
  showCount = true,
  sortable = false,
  filterable = false
}) {
  const [sortBy, setSortBy] = useState("dueDate");
  const [filterStatus, setFilterStatus] = useState("all");

  if (loading) {
    return (
      <div className="task-list-container">
        <div className="task-list-loading">
          Loading tasks...
        </div>
      </div>
    );
  }

  // Process tasks based on filters and sorting
  const processedTasks = [...tasks].filter(task => {
    if (filterStatus === "all") return true;
    if (filterStatus === "completed") return task.status === "completed" || task.status === "done";
    if (filterStatus === "pending") return task.status !== "completed" && task.status !== "done";
    return true;
  }).sort((a, b) => {
    if (sortBy === "dueDate") {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return dateA - dateB;
    }
    if (sortBy === "priority") {
      const priorityOrder = { High: 3, Medium: 2, Low: 1, None: 0 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return 0;
  });

  if (!processedTasks.length && tasks.length > 0) {
    return (
      <div className="task-list-container">
        <div className="task-list-header">
          <h3>{title}</h3>
          {showCount && (
            <div className="task-count">
              Filtered: <span>0</span> / {tasks.length}
            </div>
          )}
        </div>
        <div className="task-list-empty">
          <p>No tasks match your filter</p>
          <p className="add-task-hint">Try changing your filter settings</p>
        </div>
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="task-list-container">
        <div className="task-list-empty">
          <p>No tasks yet</p>
          <p className="add-task-hint">Create your first task to get started</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityClass = (priority) => {
    const priorityLower = (priority || 'Medium').toLowerCase();
    return `task-priority-${priorityLower}`;
  };

  const getPriorityTagClass = (priority) => {
    const priorityLower = (priority || 'Medium').toLowerCase();
    return `task-priority-tag task-priority-tag-${priorityLower}`;
  };

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <div className="task-list-title-section">
          <h3>{title}</h3>
          {showCount && (
            <div className="task-count">
              {filterable ? `Showing: ${processedTasks.length}` : `Total: ${tasks.length}`}
            </div>
          )}
        </div>
        
        {(sortable || filterable) && (
          <div className="task-list-controls">
            {sortable && (
              <select 
                className="task-list-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="dueDate">Sort by Due Date</option>
                <option value="priority">Sort by Priority</option>
              </select>
            )}
            
            {filterable && (
              <select 
                className="task-list-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending Only</option>
                <option value="completed">Completed Only</option>
              </select>
            )}
          </div>
        )}
      </div>

      <ul className="task-list">
        {processedTasks.map((task) => (
          <li 
            key={task.id} 
            className={`task-list-item ${task.status === "completed" || task.status === "done" ? "done" : ""}`}
          >
            <div className={`task-priority-indicator ${getPriorityClass(task.priority)}`}></div>
            
            <div className="task-content">
              <div className="task-header">
                <h4 className="task-title">{task.title}</h4>
                <span className={getPriorityTagClass(task.priority)}>
                  {task.priority || "None"}
                </span>
              </div>
              
              {task.description && (
                <p className="task-description">{task.description}</p>
              )}
              
              <div className="task-meta">
                <div className={`task-meta-item task-status ${task.status === "completed" || task.status === "done" ? "done" : ""}`}>
                  {task.status === "completed" || task.status === "done" ? "Completed" : "Pending"}
                </div>
                
                {task.dueDate && (
                  <>
                    <span className="task-meta-separator">•</span>
                    <div className="task-meta-item task-due">
                      Due: {formatDate(task.dueDate)}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="task-actions">
              <button 
                className="task-action-btn"
                onClick={() => onToggleStatus(task)}
              >
                {task.status === "completed" || task.status === "done" ? "Mark Pending" : "Mark Done"}
              </button>
              <button 
                className="task-action-btn"
                onClick={() => onEdit(task)}
              >
                Edit
              </button>
              <button 
                className="task-action-btn"
                onClick={() => onDelete(task.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
