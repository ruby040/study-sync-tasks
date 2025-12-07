
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import "../styles/dashboard.css";

function DashboardPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const snapshot = await getDocs(collection(db, "courses"));
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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
    <div className="dashboard-container">
      <div className="welcome-header">
        <h1>Your Dashboard</h1>
        <p>Manage your courses and track progress in one place</p>
      </div>

      {/* Stats Section (Optional - uncomment if you want stats) */}
      {/* <div className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-number">{courses.length}</span>
          <span className="stat-label">Total Courses</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">0</span>
          <span className="stat-label">Active Tasks</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">0</span>
          <span className="stat-label">Completed</span>
        </div>
      </div> */}

      {loading && <div className="dashboard-loading">Loading courses...</div>}

      {!loading && courses.length === 0 && (
        <div className="dashboard-empty">
          <p>No courses found. Ask the Firebase girl (Ruba) to add some in Firestore 😄</p>
        </div>
      )}

      {!loading && courses.length > 0 && (
        <div>
          <h2 style={{ marginBottom: "1rem", color: "#2d3748" }}>Your Courses</h2>
          <p style={{ color: "#64748b", marginBottom: "2rem" }}>
            Select a course to view and manage its task list
          </p>
          
          <div className="course-grid">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-header">
                  <span className="course-code">{course.code || course.id}</span>
                  <h3 className="course-name">
                    {course.name || "Unnamed Course"}
                  </h3>
                  {course.description && (
                    <p className="course-description">{course.description}</p>
                  )}
                </div>
                
                <div className="course-meta">
                  Course Tasks
                </div>
                
                <Link to={`/courses/${course.id}`} className="course-link">
                  Open Task List
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;