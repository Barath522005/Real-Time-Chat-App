import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '..';
import { useNavigate } from 'react-router-dom';

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/admin/users`, {
        withCredentials: true,
      });
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      fetchUsers();
    } else {
      alert("Invalid admin credentials");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="p-4">
      {!isAuthenticated ? (
        <form onSubmit={handleLogin} className="max-w-sm mx-auto">
          <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
          <div className="mb-4">
            <label className="block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Login
          </button>
        </form>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Full Name</th>
                <th className="border border-gray-300 p-2">Username</th>
                <th className="border border-gray-300 p-2">Gender</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="border border-gray-300 p-2">{user.fullName}</td>
                  <td className="border border-gray-300 p-2">{user.username}</td>
                  <td className="border border-gray-300 p-2">{user.gender}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;