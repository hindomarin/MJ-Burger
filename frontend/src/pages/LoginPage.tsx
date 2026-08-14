import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Message } from "../components/Message";
import "./LoginPage.css";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Already logged in? Then go straight to the POS.
  if (user) {
    return <Navigate to="/pos" replace />;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    // Check the form first, so we do not call the backend for nothing.
    if (username.trim() === "" || password === "") {
      setError("Please fill in your username and password");
      return;
    }

    setBusy(true);
    try {
      await login(username.trim(), password);
      navigate("/pos");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Logging in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={handleSubmit}>
        <img src="/logo.svg" alt="" className="login-logo" />
        <h1>MJ Juicy Burger</h1>
        <p className="login-tagline">Juicy • Fresh • Premium</p>

        {error && <Message text={error} type="error" />}

        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoFocus
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-gold login-button" disabled={busy}>
          {busy ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
}
