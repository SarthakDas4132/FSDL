const MetricsPanel = ({ nodes }: any) => {

  const totalValue = nodes.reduce((sum: number, n: any) => sum + (n.data.value || 0), 0)
  const overloaded = nodes.filter((n: any) => n.data.overloaded).length

  return (
    <div className="grid grid-cols-3 gap-4">

      <div className="bg-gray-800 p-3 rounded-lg">
        <div className="text-xs text-gray-400">Total System Value</div>
        <div className="text-lg">{totalValue}</div>
      </div>

      <div className="bg-gray-800 p-3 rounded-lg">
        <div className="text-xs text-gray-400">Overloaded Nodes</div>
        <div className="text-lg text-red-400">{overloaded}</div>
      </div>

      <div className="bg-gray-800 p-3 rounded-lg">
        <div className="text-xs text-gray-400">Active Nodes</div>
        <div className="text-lg">{nodes.length}</div>
      </div>

    </div>
  )
}

export default MetricsPanel