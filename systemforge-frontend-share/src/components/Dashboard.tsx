import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../config';

export default function Dashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const res = await fetch(`${BACKEND_URL}/api/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) setProjects(data);
  };

  const createNewProject = async () => {
    const name = prompt("Enter project name:");
    if (!name) return;

    const res = await fetch(`${BACKEND_URL}/api/projects`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ name, description: "New system design" })
    });
    const newProject = await res.json();
    // Navigate straight into the new canvas!
    navigate(`/canvas/${newProject._id}`);
  };

  return (
    <div className="h-screen bg-gray-950 text-white p-10">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Projects</h1>
        <button onClick={createNewProject} className="bg-blue-600 px-4 py-2 rounded font-bold">
          + New Project
        </button>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
        {projects.map(proj => (
          <div 
            key={proj._id} 
            onClick={() => navigate(`/canvas/${proj._id}`)}
            className="bg-gray-900 p-6 rounded border border-gray-800 cursor-pointer hover:border-blue-500 transition"
          >
            <h2 className="text-xl font-bold text-blue-400">{proj.name}</h2>
            <p className="text-gray-400 text-sm mt-2">ID: {proj._id.slice(-6)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}