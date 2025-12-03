// src/pages/CoursePage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    addTask,
    deleteTask,
    listenToTasks,
    updateTask,
} from "../firebase/taskService";

function CoursePage() {
  const { courseId } = useParams();
  const currentCourseId = courseId || "cs335"; // احتياط لو ما فيه بارام

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  // 🔄 real-time listener
  useEffect(() => {
    const unsubscribe = listenToTasks(currentCourseId, setTasks);
    return () => unsubscribe();
  }, [currentCourseId]);

  const handleAddTask = async () => {
    if (!title.trim()) return;
    await addTask(currentCourseId, {
      title,
      description,
      priority,
    });
    setTitle("");
    setDescription("");
    setPriority("medium");
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === "done" ? "pending" : "done";
    await updateTask(currentCourseId, task.id, { status: newStatus });
  };

  const handleDelete = async (taskId) => {
    await deleteTask(currentCourseId, taskId);
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1>Course Tasks – {currentCourseId}</h1>

      {/* form إضافة تاسك */}
      <div style={{ margin: "1rem 0" }}>
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        />

        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button onClick={handleAddTask}>Add Task</button>
      </div>

      {/* عرض الـ tasks */}
      <ul>
        {tasks.map((task) => (
          <li key={task.id} style={{ marginBottom: "0.5rem" }}>
            <span
              style={{
                textDecoration: task.status === "done" ? "line-through" : "none",
                marginRight: "0.5rem",
              }}
            >
              [{task.priority}] {task.title}{" "}
              {task.description ? `- ${task.description}` : ""}
            </span>

            <button onClick={() => toggleStatus(task)} style={{ marginRight: "0.3rem" }}>
              {task.status === "done" ? "Mark Pending" : "Mark Done"}
            </button>

            <button onClick={() => handleDelete(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CoursePage;
