import { BACKEND_URL } from './config'; // adjust path if needed based on your file structure
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomNode from './components/nodes/CustomNode';
import Inspector from './components/inspector/Inspector';
import ChartPanel from './components/ChartPanel';
import MetricsPanel from './components/MetricsPanel';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const nodeTypes = { custom: CustomNode };

// Connect to your backend outside the component so it only connects once
const socket = io('http://localhost:5000'); 

function FlowApp() {
  // 1. DYNAMICALLY GET THE ID FROM THE URL
  const { id: PROJECT_ID } = useParams();
  const token = localStorage.getItem('token');

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const selectedNode = nodes.find(n => n.selected) || null;
  const selectedEdge = edges.find(e => e.selected) || null;

  const [history, setHistory] = useState<any[]>([]);
  const [nodeName, setNodeName] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);

  // =============================
  // WEBSOCKET SIMULATION LOOP
  // =============================
  useEffect(() => {
    if (!PROJECT_ID) return;

    socket.emit('join_project', PROJECT_ID);

    socket.on('tick_update', (data) => {
      if (data.nodes && data.nodes.length > 0) {
        
        // SAFELY merge server data with local user edits!
        setNodes(currentNodes => {
          return data.nodes.map((serverNode: any) => {
            const localNode = currentNodes.find(n => n.id === serverNode.id);
            
            // If the user is currently typing in the Inspector, preserve their edits!
            if (localNode && localNode.data.locked) {
              return {
                ...serverNode,
                data: {
                  ...serverNode.data,
                  rate: localNode.data.rate,         // Keep typed rate
                  capacity: localNode.data.capacity, // Keep typed capacity
                  label: localNode.data.label,       // Keep typed label
                  locked: true                       // Keep it locked
                }
              };
            }
            return serverNode; // Not editing? Accept full server data
          });
        });

        setEdges(data.edges);

        const snapshot: any = { time: Date.now() };
        data.nodes.forEach((n: any) => {
          snapshot[n.id] = n.data.value;
        });
        setHistory(prev => [...prev.slice(-25), snapshot]);
      }
    });

    return () => {
      socket.off('tick_update');
    };
  }, [PROJECT_ID]);

  // =============================
  // LOAD INITIAL CANVAS FROM DB
  // =============================
  useEffect(() => {
    const loadProject = async () => {
      if (!PROJECT_ID || !token) return;
      
      try {
        const res = await fetch(`http://localhost:5000/api/projects/${PROJECT_ID}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        
        if (data.nodes && data.edges) {
          setNodes(data.nodes);
          setEdges(data.edges);
        }
      } catch (error) {
        console.error("Failed to load project:", error);
      }
    };
    
    loadProject();
  }, [PROJECT_ID, token]);

  // =============================
  // NODE MANAGEMENT
  // =============================
  const createNode = () => {
    const finalName = nodeName.trim() ? nodeName : `Node ${nodes.length + 1}`;

    const newNode = {
      id: Date.now().toString(),
      type: 'custom',
      position: { 
        x: 250 + (Math.random() * 100 - 50), 
        y: 200 + (Math.random() * 100 - 50) 
      },
      data: {
        label: finalName,
        value: 0,
        rate: 10,
        capacity: 100,
        overload_threshold: 80,
        overloaded: false,
        locked: false
      }
    }

    setNodes(nds => [...nds, newNode])
    setNodeName("")
  }

  const deleteNode = () => {
    if (!selectedNode) return

    setNodes(nds => nds.filter(n => n.id !== selectedNode.id))
    setEdges(eds =>
      eds.filter(e =>
        e.source !== selectedNode.id &&
        e.target !== selectedNode.id
      )
    )
  }

  const deleteEdge = () => {
    if (!selectedEdge) return
    setEdges(eds => eds.filter(e => e.id !== selectedEdge.id))
  }

  const onConnect = (params: any) => {
    setEdges(eds => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#60a5fa', strokeWidth: 2 }
    }, eds))
  }

  const updateNode = (id: string, newData: any) => {
    setNodes(currentNodes => {
      const updatedNodes = currentNodes.map(n =>
        n.id === id
          ? { ...n, data: { ...n.data, ...newData } }
          : n
      );

      // If the user clicked "Resume Simulation", push the new circuit and restart engine!
      if (newData.locked === false) {
        fetch(`${BACKEND_URL}/api/projects/${PROJECT_ID}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ nodes: updatedNodes, edges })
        }).then(() => {
          // FORCE the backend engine to restart and grab the new rate/capacity
          socket.emit('stop_simulation', PROJECT_ID);
          setTimeout(() => socket.emit('start_simulation', PROJECT_ID), 100);
        }).catch(err => console.error("Failed to sync to backend:", err));
      }

      return updatedNodes;
    });
  }

  // =============================
  // RESET SIMULATION (KEEP STRUCTURE)
  // =============================
  const resetSimulation = () => {
    setNodes(nodes =>
      nodes.map(n => ({
        ...n,
        data: {
          ...n.data,
          value: 0,
          overloaded: false,
          locked: false
        }
      }))
    )

    setHistory([])
    setIsRunning(false)
  }

  // =============================
  // RESET CIRCUIT (DELETE EVERYTHING)
  // =============================
  const resetCircuit = () => {
    setNodes([])
    setEdges([])
    setHistory([])
    setIsRunning(false)
  }

  // =============================
  // UI
  // =============================
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">

      {/* HEADER */}
      <div className="flex items-center px-6 py-3 bg-gray-900/80 border-b border-gray-800 backdrop-blur">

        <h1 className="text-xl text-blue-400 font-bold">
          SystemForge Studio
        </h1>

        <div className="ml-auto flex gap-3">

          <button
            onClick={() => socket.emit('start_simulation', PROJECT_ID)}
            className="bg-green-600 px-3 py-1 rounded hover:bg-green-500 transition"
          >
            Play
          </button>

          <button
            onClick={async () => {
              if (!token) {
                alert("You are not logged in!");
                return;
              }
              await fetch(`http://localhost:5000/api/projects/${PROJECT_ID}`, {
                method: 'PUT',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ nodes, edges })
              });
              alert("Circuit Saved to Database!");
            }}
            className="bg-blue-600 px-3 py-1 rounded border border-blue-400 hover:bg-blue-500 transition"
          >
            Save Circuit
          </button>

          <button
            onClick={() => socket.emit('stop_simulation', PROJECT_ID)}
            className="bg-yellow-600 px-3 py-1 rounded hover:bg-yellow-500 transition"
          >
            Pause
          </button>

          <button
            onClick={resetSimulation}
            className="bg-purple-600 px-3 py-1 rounded hover:bg-purple-500 transition"
          >
            Reset Simulation
          </button>

          <button
            onClick={() => {
              if (confirm("Delete entire circuit?")) {
                resetCircuit()
              }
            }}
            className="bg-red-700 px-3 py-1 rounded hover:bg-red-600 transition"
          >
            Reset Circuit
          </button>

          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-500 transition"
          >
            Toggle Analytics
          </button>

        </div>
      </div>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="w-72 p-4 bg-gray-900/70 border-r border-gray-800 backdrop-blur space-y-3">

          <input
            value={nodeName}
            onChange={(e) => setNodeName(e.target.value)}
            placeholder="Create node..."
            className="w-full p-2 bg-gray-800 rounded outline-none border border-gray-700 focus:border-blue-500"
          />

          <button
            onClick={createNode}
            className="w-full bg-blue-600 p-2 rounded hover:bg-blue-500 transition"
          >
            Add Node
          </button>

          <button
            onClick={deleteNode}
            className="w-full bg-red-600 p-2 rounded hover:bg-red-500 transition"
          >
            Delete Node
          </button>

          <button
            onClick={deleteEdge}
            className="w-full bg-red-500 p-2 rounded hover:bg-red-400 transition"
          >
            Delete Edge
          </button>

        </div>

        {/* CANVAS */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
          >
            <Background gap={16} size={1} color="#374151" />
            <Controls />
          </ReactFlow>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-80 p-4 bg-gray-900/70 border-l border-gray-800 backdrop-blur">
          <Inspector node={selectedNode} updateNode={updateNode} />
        </div>

      </div>

      {/* ANALYTICS */}
      {showAnalytics && (
        <div className="h-56 border-t border-gray-800 bg-gray-900/80 p-3 space-y-2 backdrop-blur">
          <MetricsPanel nodes={nodes} />
          <div className="h-32">
            <ChartPanel data={history} />
          </div>
        </div>
      )}

    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* The dynamic canvas route */}
        <Route path="/canvas/:id" element={
          <ReactFlowProvider>
            <FlowApp />
          </ReactFlowProvider>
        } />
        
        {/* Default fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}