import { Handle, Position } from 'reactflow'

const CustomNode = ({ data }: any) => {

  let border = 'border-green-400'
  if (data.overloaded) border = 'border-red-500'

  return (
    <div className={`bg-gray-800 ${border} border-2 rounded p-2`}>

      <Handle type="target" position={Position.Left} />

      <div>{data.label}</div>
      <div>Value: {data.value}</div>

      {data.overloaded && <div className="text-red-400 text-xs">OVERLOAD</div>}

      <Handle type="source" position={Position.Right} />

    </div>
  )
}

export default CustomNode