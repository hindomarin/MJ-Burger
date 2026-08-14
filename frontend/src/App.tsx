import { useEffect, useState } from "react";
import "./App.css";

// The address of the backend API. It comes from the .env file
// so we can change it later without editing the code.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function App() {
  const [apiStatus, setApiStatus] = useState("Checking...");

  // When the page loads, ask the backend if it is running.
  // This is only here to prove that frontend and backend are connected.
  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then((response) => response.json())
      .then((data) => setApiStatus(data.message))
      .catch(() => setApiStatus("Backend not reachable"));
  }, []);

  return (
    <div className="app">
      <header className="header">
        <img src="/logo.svg" alt="MJ Juicy Burger" className="logo" />
        <div>
          <h1>MJ Juicy Burger</h1>
          <p className="tagline">Juicy • Fresh • Premium</p>
        </div>
      </header>

      <main className="main">
        <h2>Project setup complete</h2>
        <p className="status">API: {apiStatus}</p>
      </main>
    </div>
  );
}

export default App;
