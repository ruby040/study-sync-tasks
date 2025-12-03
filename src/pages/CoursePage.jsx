import { useParams } from "react-router-dom";

function CoursePage() {
  const { courseId } = useParams();

  return (
    <div className="page">
      <h1>Course: {courseId}</h1>
      <p>Here you will see and manage tasks for this course.</p>
      {/* بعدين تركبين TaskForm + TaskList مع Firestore */}
    </div>
  );
}

export default CoursePage;
