const Sidebar = ({ createNode }: any) => {

  return (
    <div>
      <h2 className="mb-3">Components</h2>

      <button onClick={() => createNode('Source')} className="bg-purple-600 p-2 w-full mb-2 rounded">
        Add Source
      </button>

      <button onClick={() => createNode('Processor')} className="bg-blue-600 p-2 w-full mb-2 rounded">
        Add Processor
      </button>

      <button onClick={() => createNode('Storage')} className="bg-green-600 p-2 w-full rounded">
        Add Storage
      </button>
    </div>
  )
}

export default Sidebar