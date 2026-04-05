import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider
} from 'reactflow'
import 'reactflow/dist/style.css'

import { useEffect, useState } from 'react'

import CustomNode from './components/nodes/CustomNode'
import Inspector from './components/inspector/Inspector'
import ChartPanel from './components/ChartPanel'
import MetricsPanel from './components/MetricsPanel'

const nodeTypes = { custom: CustomNode }

function FlowApp() {

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [selectedEdge, setSelectedEdge] = useState<any>(null)

  const [history, setHistory] = useState<any[]>([])
  const [nodeName, setNodeName] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(true)

  // =============================
  // SIMULATION LOOP
  // =============================
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {

      setNodes(prevNodes => {

        const nodeMap: any = {}
        prevNodes.forEach(n => {
          nodeMap[n.id] = { ...n, incoming: 0 }
        })

        const updatedEdges = edges.map(e => {
          const source = nodeMap[e.source]
          const target = nodeMap[e.target]

          if (!source || !target) return e

          const efficiency = source.data.overloaded ? 0.3 : 1
          const flow = (source.data.value || 0) * 0.2 * efficiency

          target.incoming += flow

          return {
            ...e,
            animated: true,
            style: {
              stroke: source.data.overloaded ? '#ef4444' : '#60a5fa',
              strokeWidth: 2
            }
          }
        })

        setEdges(updatedEdges)

        const updatedNodes = prevNodes.map(node => {

          if (node.data.locked) return node

          let value = node.data.value || 0
          value += nodeMap[node.id].incoming
          value += node.data.rate || 0

          const capacity = node.data.capacity || 100
          const threshold = node.data.overloadThreshold || capacity

          const overloaded = value > threshold

          value = Math.min(value, capacity)

          return {
            ...node,
            data: {
              ...node.data,
              value: Math.floor(value),
              overloaded
            }
          }
        })

        const snapshot: any = { time: Date.now() }
        updatedNodes.forEach(n => {
          snapshot[n.id] = n.data.value
        })

        setHistory(prev => [...prev.slice(-25), snapshot])

        return updatedNodes
      })

    }, 1000)

    return () => clearInterval(interval)

  }, [edges, isRunning])

  // =============================
  // NODE MANAGEMENT
  // =============================
  const createNode = () => {
    if (!nodeName.trim()) return

    const newNode = {
      id: Date.now().toString(),
      type: 'custom',
      position: { x: 200, y: 150 },
      data: {
        label: nodeName,
        value: 0,
        rate: 10,
        capacity: 100,
        overloadThreshold: 80,
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
    setNodes(nodes =>
      nodes.map(n =>
        n.id === id
          ? { ...n, data: { ...n.data, ...newData } }
          : n
      )
    )
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
    setSelectedNode(null)
    setSelectedEdge(null)
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
            onClick={() => setIsRunning(true)}
            className="bg-green-600 px-3 py-1 rounded"
          >
            Play
          </button>

          <button
            onClick={() => setIsRunning(false)}
            className="bg-yellow-600 px-3 py-1 rounded"
          >
            Pause
          </button>

          <button
            onClick={resetSimulation}
            className="bg-purple-600 px-3 py-1 rounded"
          >
            Reset Simulation
          </button>

          <button
            onClick={() => {
              if (confirm("Delete entire circuit?")) {
                resetCircuit()
              }
            }}
            className="bg-red-700 px-3 py-1 rounded"
          >
            Reset Circuit
          </button>

          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="bg-blue-600 px-3 py-1 rounded"
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
            className="w-full p-2 bg-gray-800 rounded"
          />

          <button
            onClick={createNode}
            className="w-full bg-blue-600 p-2 rounded"
          >
            Add Node
          </button>

          <button
            onClick={deleteNode}
            className="w-full bg-red-600 p-2 rounded"
          >
            Delete Node
          </button>

          <button
            onClick={deleteEdge}
            className="w-full bg-red-500 p-2 rounded"
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
            onNodeClick={(e, node) => setSelectedNode(node)}
            onEdgeClick={(e, edge) => setSelectedEdge(edge)}
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
    <ReactFlowProvider>
      <FlowApp />
    </ReactFlowProvider>
  )
}