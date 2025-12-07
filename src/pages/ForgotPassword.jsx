import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { Link } from "react-router-dom";
import "../styles/auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (err) {
      console.error(err);
      setError("Failed to send reset email. Check the email address.");
    }
  };

  return (
    <div className="auth-container">
  <h1>Reset Password</h1>

  {message && <p style={{ color: "green" }}>{message}</p>}
  {error && <p style={{ color: "red" }}>{error}</p>}

  <form onSubmit={handleReset}>
    <input
      type="email"
      placeholder="Enter your email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />

    <button type="submit">Send Reset Email</button>
  </form>

  <p>
    <Link to="/login">Back to login</Link>
  </p>
</div>

  );
}

export default ForgotPassword;
