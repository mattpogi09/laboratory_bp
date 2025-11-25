import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function LineChartComponent({ data, dataKey = 'value', nameKey = 'label', color = '#10b981' }) {
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg border border-gray-700">
                    <p className="text-sm font-medium">{payload[0].payload[nameKey]}</p>
                    <p className="text-xs text-emerald-400">Revenue: ₱{parseFloat(payload[0].value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis 
                    dataKey={nameKey} 
                    stroke="#6b7280" 
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                />
                <YAxis 
                    stroke="#6b7280" 
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                    tickFormatter={(value) => `₱${value.toLocaleString()}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={3}
                    fill="url(#colorRevenue)"
                    dot={{ fill: color, strokeWidth: 2, r: 4, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
