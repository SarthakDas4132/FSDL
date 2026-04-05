import { Handle, Position } from 'reactflow';

export default function CustomNode({ data, selected }: any) {
  return (
    <div className={`p-4 rounded-lg border-2 bg-gray-800 text-white shadow-xl min-w-[150px] ${selected ? 'border-blue-500' : 'border-gray-600'} ${data.overloaded ? 'border-red-500' : ''}`}>
      
      {/* Top Handle (Target for incoming connections) */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      
      <div className="font-bold text-lg text-blue-400 border-b border-gray-700 pb-2 mb-2 text-center">
        {data.label}
      </div>
      
      <div className="space-y-1 text-sm font-mono">
        <p>Val: <span className="text-green-400">{data.value || 0}</span></p>
        <p>Rate: <span className="text-yellow-400">{data.rate || 0}</span></p>
        <p>Cap: <span className="text-purple-400">{data.capacity || 0}</span></p>
      </div>

      {/* Bottom Handle (Source for outgoing connections) */}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500" />
    </div>
  );
}