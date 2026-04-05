import { useEffect, useState } from 'react'

const Inspector = ({ node, updateNode }: any) => {

  const [local, setLocal] = useState<any>(null)

  useEffect(() => {
    if (node) setLocal({ ...node.data })
  }, [node])

  if (!node || !local) {
    return <div className="text-gray-400">Select a node to edit its properties</div>
  }

  const update = (key: string, val: any) => {
    const updated = { ...local, [key]: val, locked: true }
    setLocal(updated)
    updateNode(node.id, updated)
  }

  return (
    <div className="space-y-4">

      <div>
        <label className="text-sm text-gray-400">Node Name</label>
        <input
          value={local.label}
          onChange={(e) => update("label", e.target.value)}
          className="w-full p-2 bg-gray-800 rounded"
        />
      </div>

      <div>
        <label className="text-sm text-gray-400">
          Rate (Generation per tick)
        </label>
        <input
          type="number"
          value={local.rate}
          onChange={(e) => update("rate", Number(e.target.value))}
          className="w-full p-2 bg-gray-800 rounded"
        />
      </div>

      <div>
        <label className="text-sm text-gray-400">
          Capacity (Maximum storage)
        </label>
        <input
          type="number"
          value={local.capacity}
          onChange={(e) => update("capacity", Number(e.target.value))}
          className="w-full p-2 bg-gray-800 rounded"
        />
      </div>

      <div>
        <label className="text-sm text-gray-400">
          Overload Threshold (Stress limit)
        </label>
        <input
          type="number"
          value={local.overloadThreshold}
          onChange={(e) => update("overloadThreshold", Number(e.target.value))}
          className="w-full p-2 bg-gray-800 rounded"
        />
      </div>

      <button
        onClick={() => updateNode(node.id, { locked: false })}
        className="bg-yellow-600 w-full p-2 rounded"
      >
        Resume Simulation
      </button>

    </div>
  )
}

export default Inspector