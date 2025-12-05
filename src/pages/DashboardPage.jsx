
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

function DashboardPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // نجيب كل الكورسات من مجموعة "courses"
    const fetchCourses = async () => {
      try {
        const snapshot = await getDocs(collection(db, "courses"));
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,        // مثال: "cs335"
          ...doc.data(),     // مثال: { code: "CS335", name: "Cloud Computing" }
        }));
        setCourses(list);
      } catch (error) {
        console.error("Error loading courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <h1>Dashboard</h1>
      <p>Here you can see your courses and open their shared task lists.</p>

      {loading && <p>Loading courses...</p>}

      {!loading && courses.length === 0 && (
        <p>No courses found. Ask the Firebase girl (Ruba) to add some in Firestore 😄</p>
      )}

      {!loading && courses.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <h2>Your courses</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {courses.map((course) => (
              <li
                key={course.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  padding: "0.75rem 1rem",
                  marginBottom: "0.75rem",
                }}
              >
                <div style={{ fontWeight: "bold" }}>
                  {course.code || course.id} — {course.name || "Unnamed course"}
                </div>

                <Link to={`/courses/${course.id}`}>
                  Open task list
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
