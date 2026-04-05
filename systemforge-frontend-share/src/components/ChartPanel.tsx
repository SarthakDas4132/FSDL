import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const ChartPanel = ({ data }: any) => {

  if (!data || data.length === 0) return null

  const keys = Object.keys(data[0]).filter(k => k !== 'time')

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>

        <XAxis dataKey="time" tick={false} />
        <YAxis />
        
        <Tooltip
          contentStyle={{
            backgroundColor: '#111827',
            border: '1px solid #374151'
          }}
        />

        {keys.map((k, i) => (
          <Line
            key={k}
            dataKey={k}
            stroke={`hsl(${i * 60}, 70%, 50%)`}
            dot={false}
          />
        ))}

      </LineChart>
    </ResponsiveContainer>
  )
}

export default ChartPanel