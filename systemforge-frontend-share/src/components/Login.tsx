import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../config';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Decide which endpoint to hit based on the toggle state
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok && data.token) {
        // Save the golden ticket to the browser
        localStorage.setItem('token', data.token);
        // Send the user to the Lobby
        navigate('/dashboard');
      } else {
        alert(data.message || "Authentication failed");
      }
    } catch (err) {
      console.error(err);
      alert("Could not connect to the server.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 w-96 shadow-xl">
        
        {/* Toggle Buttons */}
        <div className="flex mb-6 border-b border-gray-700">
          <button 
            className={`flex-1 pb-2 font-bold ${isLogin ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500'}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`flex-1 pb-2 font-bold ${!isLogin ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-500'}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Only show Name input if we are Registering */}
          {!isLogin && (
            <input 
              type="text" placeholder="Full Name" required
              className="w-full p-2 bg-gray-800 rounded border border-gray-700 outline-none focus:border-green-500"
              value={name} onChange={e => setName(e.target.value)}
            />
          )}
          
          <input 
            type="email" placeholder="Email" required
            className={`w-full p-2 bg-gray-800 rounded border border-gray-700 outline-none focus:border-${isLogin ? 'blue' : 'green'}-500`}
            value={email} onChange={e => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Password" required
            className={`w-full p-2 bg-gray-800 rounded border border-gray-700 outline-none focus:border-${isLogin ? 'blue' : 'green'}-500`}
            value={password} onChange={e => setPassword(e.target.value)}
          />
          
          <button type="submit" className={`w-full p-2 rounded font-bold transition ${isLogin ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'}`}>
            {isLogin ? 'Enter Studio' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}