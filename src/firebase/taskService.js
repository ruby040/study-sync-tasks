import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

/**
 * Subscribe to tasks of a specific course.
 * Real-time listener.
 */
export function subscribeToCourseTasks(courseId, callback) {
  const tasksRef = collection(db, "courses", courseId, "tasks");
  const q = query(tasksRef, orderBy("dueDate", "asc"), orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    callback(tasks);
  });
}

/**
 * Create new task
 */
export async function addTask(courseId, { title, description, priority, dueDate, assignedTo }) {
  const tasksRef = collection(db, "courses", courseId, "tasks");

  const dueDateValue = dueDate ? new Date(dueDate) : null;

  await addDoc(tasksRef, {
    title,
    description: description || "",
    priority: priority || "Medium",
    status: "pending",
    assignedTo: assignedTo || "",   
    dueDate: dueDateValue,
    createdAt: serverTimestamp(),
  });
}

/**
 * Update any fields in a task
 */
export async function updateTask(courseId, taskId, data) {
  const taskRef = doc(db, "courses", courseId, "tasks", taskId);
  await updateDoc(taskRef, data);
}

/**
 * Toggle status pending/done
 */
export async function toggleTaskStatus(courseId, taskId, currentStatus) {
  const newStatus = currentStatus === "done" ? "pending" : "done";
  await updateTask(courseId, taskId, { status: newStatus });
}

/**
 * Delete task
 */
export async function deleteTask(courseId, taskId) {
  const taskRef = doc(db, "courses", courseId, "tasks", taskId);
  await deleteDoc(taskRef);
}
