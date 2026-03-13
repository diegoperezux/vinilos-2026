import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Admin from "./admin/Admin.jsx";

function Root() {
  const [isAdmin, setIsAdmin] = useState(
    window.location.hash.startsWith("#/admin"),
  );

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdmin(window.location.hash.startsWith("#/admin"));
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return isAdmin ? <Admin /> : <App />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
