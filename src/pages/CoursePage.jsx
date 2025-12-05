import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  subscribeToCourseTasks,
  addTask,
  updateTask,
  toggleTaskStatus,
  deleteTask,
} from "../firebase/taskService";

function CoursePage() {
  const { courseId } = useParams(); // المفروض يعطيك "cs335" مثلًا

  const [tasks, setTasks] = useState([]);

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState(""); // yyyy-mm-dd
  const [assignedTo, setAssignedTo] = useState("");

  // filters
  const [filterStatus, setFilterStatus] = useState("all");    // all | pending | done
  const [filterPriority, setFilterPriority] = useState("all"); // all | Low | Medium | High
  const [filterAssignee, setFilterAssignee] = useState("all"); // all or name/email
  const [sortBy, setSortBy] = useState("dueDate");            // dueDate | createdAt

  // edit mode
  const [editingTaskId, setEditingTaskId] = useState(null);

  useEffect(() => {
    if (!courseId) return;

    const unsubscribe = subscribeToCourseTasks(courseId, (data) => {
      setTasks(data);
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
        const ad = a.dueDate?.toDate ? a.dueDate.toDate().getTime() : 0;
        const bd = b.dueDate?.toDate ? b.dueDate.toDate().getTime() : 0;
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

  return (
    <div style={{ padding: "1.5rem" }}>
      <h2>Course Tasks – {courseId}</h2>

      {/* Form create / edit */}
      <form
        onSubmit={editingTaskId ? handleSaveEdit : handleAddTask}
        style={{ margin: "1rem 0" }}
      >
        <input
          type="text"
          placeholder="Task title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <input
          type="text"
          placeholder="Assigned to (name/email)"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
        />

        <button type="submit">
          {editingTaskId ? "Save changes" : "Add Task"}
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
      </form>

      {/* Filters */}
      <div style={{ marginBottom: "1rem" }}>
        <span>Filter status: </span>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="done">Done</option>
        </select>

        <span> Priority: </span>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="all">All</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <span> Sort by: </span>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="dueDate">Due date</option>
          <option value="createdAt">Created time</option>
        </select>
      </div>

      {/* Tasks list */}
      <ul>
        {filteredAndSortedTasks().map((task) => (
          <li key={task.id}>
            <strong>[{task.priority?.toLowerCase()}]</strong>{" "}
            {task.title}{" "}
            {task.description && <>- {task.description}</>}
            {task.dueDate?.toDate && (
              <> — due: {task.dueDate.toDate().toLocaleDateString()}</>
            )}
            {task.assignedTo && <> — assigned to: {task.assignedTo}</>}
            {"  "}
            <button
              onClick={() =>
                toggleTaskStatus(courseId, task.id, task.status || "pending")
              }
            >
              {task.status === "done" ? "Mark Pending" : "Mark Done"}
            </button>
            <button onClick={() => handleStartEdit(task)}>Edit</button>
            <button onClick={() => deleteTask(courseId, task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CoursePage;
