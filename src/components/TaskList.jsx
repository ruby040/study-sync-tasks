function TaskList({ tasks = [], onToggleStatus, onEdit, onDelete }) {
  if (!tasks.length) {
    return <p>No tasks yet.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id} className={task.status === "completed" ? "done" : ""}>
          <div>
            <strong>{task.title}</strong>
            {task.description && <p>{task.description}</p>}
            <small>
              Priority: {task.priority || "None"}{" "}
              {task.dueDate && <>| Due: {task.dueDate}</>}
            </small>
          </div>

          <div className="task-actions">
            <button onClick={() => onToggleStatus(task)}>
              {task.status === "completed" ? "Mark Pending" : "Mark Done"}
            </button>
            <button onClick={() => onEdit(task)}>Edit</button>
            <button onClick={() => onDelete(task.id)}>Delete</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default TaskList;
