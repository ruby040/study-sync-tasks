import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import "../styles/auth.css";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await sendEmailVerification(user);

      alert("Verification email sent. Please check your inbox.");

      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="auth-container">
  <h1>Create Account</h1>

  {error && <p style={{ color: "red" }}>{error}</p>}

  <form onSubmit={handleRegister}>
    <input
      type="text"
      placeholder="Display Name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      required
    />

    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />

    <button type="submit">Create Account</button>
  </form>

  <p>
    Already have an account? <Link to="/login">Login</Link>
  </p>
</div>

  );
}

export default RegisterPage;
