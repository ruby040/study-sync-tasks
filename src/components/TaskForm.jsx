import { useState, useEffect } from "react";
import "./task-form.css";

const emptyTask = {
  title: "",
  description: "",
  priority: "Medium",
  dueDate: "",
};

function TaskForm({ 
  onSubmit, 
  editingTask, 
  onCancel, 
  isLoading = false,
  maxTitleLength = 100,
  maxDescLength = 500,
  compact = false
}) {
  const [form, setForm] = useState(emptyTask);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title || "",
        description: editingTask.description || "",
        priority: editingTask.priority || "Medium",
        dueDate: editingTask.dueDate || "",
      });
    } else {
      setForm(emptyTask);
    }
    setTouched({});
    setErrors({});
  }, [editingTask]);

  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "title":
        if (!value.trim()) {
          error = "Task title is required";
        } else if (value.length > maxTitleLength) {
          error = `Title must be less than ${maxTitleLength} characters`;
        }
        break;
      case "description":
        if (value.length > maxDescLength) {
          error = `Description must be less than ${maxDescLength} characters`;
        }
        break;
      case "dueDate":
        if (value) {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            error = "Due date cannot be in the past";
          }
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, form[name]);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handlePriorityClick = (priority) => {
    setForm(prev => ({ ...prev, priority }));
    if (touched.priority) {
      setErrors(prev => ({ ...prev, priority: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(form).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    // Validate all fields
    if (!validateForm()) {
      return;
    }
    
    onSubmit(form);
    if (!editingTask) {
      setForm(emptyTask);
      setTouched({});
      setErrors({});
    }
  };

  const isFormValid = Object.keys(errors).length === 0 && form.title.trim() !== "";

  return (
    <div className={`task-form-container ${compact ? 'compact' : ''} ${isLoading ? 'loading' : ''}`}>
      {isLoading && <div className="task-form-loading"></div>}
      
      <div className="task-form-header">
        <h3 className={editingTask ? 'edit-mode' : ''}>
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </h3>
        {editingTask && (
          <div className="task-form-status">
            Editing: {editingTask.title || "Task"}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="task-form-grid">
          {/* Title Input */}
          <div className="task-form-group full-width">
            <label htmlFor="title" className="task-form-label required">
              Task Title
            </label>
            <input
              id="title"
              name="title"
              className="task-form-input"
              placeholder="Enter a descriptive task title"
              value={form.title}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              disabled={isLoading}
            />
            <div className="char-counter">
              {form.title.length} / {maxTitleLength}
            </div>
            {touched.title && errors.title && (
              <div className="task-form-validation error">
                {errors.title}
              </div>
            )}
          </div>

          {/* Description Input */}
          <div className="task-form-group full-width">
            <label htmlFor="description" className="task-form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="task-form-textarea"
              placeholder="Add detailed description (optional)"
              value={form.description}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
            />
            <div className="char-counter">
              {form.description.length} / {maxDescLength}
            </div>
            {touched.description && errors.description && (
              <div className="task-form-validation error">
                {errors.description}
              </div>
            )}
          </div>

          {/* Priority Selection */}
          <div className="task-form-group full-width">
            <label className="task-form-label">Priority</label>
            <div className="priority-options">
              {['Low', 'Medium', 'High'].map((priority) => (
                <div
                  key={priority}
                  className={`priority-option ${form.priority === priority ? 'selected' : ''}`}
                  onClick={() => handlePriorityClick(priority)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handlePriorityClick(priority);
                    }
                  }}
                >
                  <div className={`priority-dot ${priority.toLowerCase()}`}></div>
                  <span className="priority-label">{priority}</span>
                </div>
              ))}
            </div>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              onBlur={handleBlur}
              className="task-form-select"
              style={{ display: 'none' }}
              disabled={isLoading}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Due Date Input */}
          <div className="task-form-group half-width">
            <label htmlFor="dueDate" className="task-form-label">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              className="task-form-input"
              value={form.dueDate}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              min={new Date().toISOString().split('T')[0]}
            />
            {touched.dueDate && errors.dueDate && (
              <div className="task-form-validation error">
                {errors.dueDate}
              </div>
            )}
          </div>

          {/* Additional fields can be added here */}
        </div>

        <div className="task-form-actions">
          <button
            type="submit"
            className={`task-form-submit ${editingTask ? 'update-mode' : 'create-mode'}`}
            disabled={isLoading || !isFormValid}
          >
            {editingTask ? 'Update Task' : 'Create Task'}
          </button>
          
          {editingTask && (
            <button
              type="button"
              className="task-form-cancel"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default TaskForm;