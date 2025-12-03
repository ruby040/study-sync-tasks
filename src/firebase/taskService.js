// src/firebase/taskService.js
import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

// 🔄 real-time listener
export function listenToTasks(courseId, callback) {
  const tasksRef = collection(db, "courses", courseId, "tasks");

  const unsub = onSnapshot(
    tasksRef,
    (snapshot) => {
      const tasks = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      console.log("TASKS SNAPSHOT >>>", tasks);
      callback(tasks);
    },
    (error) => {
      console.error("Firestore listen error:", error);
    }
  );

  return unsub;
}

// ➕ إضافة تاسك
export async function addTask(courseId, taskData) {
  const tasksRef = collection(db, "courses", courseId, "tasks");
  console.log("ADDING TASK >>>", courseId, taskData);

  await addDoc(tasksRef, {
    title: taskData.title,
    description: taskData.description || "",
    priority: taskData.priority || "low",
    status: "pending",
  });
}

// 🔁 تحديث تاسك
export async function updateTask(courseId, taskId, updates) {
  const taskRef = doc(db, "courses", courseId, "tasks", taskId);
  await updateDoc(taskRef, updates);
}

// ❌ حذف تاسك
export async function deleteTask(courseId, taskId) {
  const taskRef = doc(db, "courses", courseId, "tasks", taskId);
  await deleteDoc(taskRef);
}
