import { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import "../App.css";

export default function Dashboard() {
  const [data, setData] = useState({
    leads: [],
    tasks: [],
    users: [],
  });

  const [newLead, setNewLead] = useState("");
  const [newTask, setNewTask] = useState("");
  const [newUser, setNewUser] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  if (!localStorage.getItem("token")) {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/dashboard`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((res) => setData(res.data))
      .catch(() => alert("Unauthorized"));
  }, []);

  const addItem = async (type, value, setter) => {
    if (!value) return;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/add-${type}`,
        { value },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        },
      );

      setData({ ...data, [type + "s"]: res.data });
      setter("");
    } catch {
      alert("Error adding");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div>
      <div className="navbar">
        <h2>Dashboard</h2>
        <div>
          <span className="user-name">Hi, {user?.name}</span>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-container">
        <div className="add-section">
          <input
            className="auth-input"
            placeholder="Add Lead"
            value={newLead}
            onChange={(e) => setNewLead(e.target.value)}
          />
          <button
            className="add-btn"
            onClick={() => addItem("lead", newLead, setNewLead)}
          >
            Add Lead
          </button>
        </div>

        <div className="add-section">
          <input
            className="auth-input"
            placeholder="Add Task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <button
            className="add-btn"
            onClick={() => addItem("task", newTask, setNewTask)}
          >
            Add Task
          </button>
        </div>

        <div className="add-section">
          <input
            className="auth-input"
            placeholder="Add User"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
          />
          <button
            className="add-btn"
            onClick={() => addItem("user", newUser, setNewUser)}
          >
            Add User
          </button>
        </div>

        <h3>Leads</h3>
        <table className="data-table">
          <tbody>
            {data.leads?.map((item, i) => (
              <tr key={i}>
                <td>{item}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Tasks</h3>
        <table className="data-table">
          <tbody>
            {data.tasks?.map((item, i) => (
              <tr key={i}>
                <td>{item}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Users</h3>
        <table className="data-table">
          <tbody>
            {data.users?.map((item, i) => (
              <tr key={i}>
                <td>{item}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
