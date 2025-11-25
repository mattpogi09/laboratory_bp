import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function DoughnutChartComponent({ data }) {
    const COLORS = {
        'Pending': '#ef4444',
        'Processing': '#eab308',
        'Completed': '#3b82f6',
        'Released': '#22c55e',
    };

    // Filter out entries with 0 values for cleaner visualization
    const filteredData = data.filter(item => item.value > 0);
    
    // If all values are 0, show a placeholder
    const hasData = filteredData.length > 0;

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg border border-gray-700">
                    <p className="text-sm font-medium">{payload[0].name}</p>
                    <p className="text-xs text-emerald-400">{payload[0].value} tests</p>
                </div>
            );
        }
        return null;
    };

    const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent === 0) return null;

        return (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor="middle" 
                dominantBaseline="central"
                className="text-xs font-semibold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            {!hasData ? (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400 text-sm">No test data available</p>
                </div>
            ) : (
                <PieChart>
                    <Pie
                        data={filteredData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={CustomLabel}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                    >
                        {filteredData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                        payload={[
                            { value: 'Pending', type: 'circle', color: COLORS['Pending'] },
                            { value: 'Processing', type: 'circle', color: COLORS['Processing'] },
                            { value: 'Completed', type: 'circle', color: COLORS['Completed'] },
                            { value: 'Released', type: 'circle', color: COLORS['Released'] }
                        ]}
                        verticalAlign="bottom" 
                        height={36}
                        iconType="circle"
                    />
                </PieChart>
            )}
        </ResponsiveContainer>
    );
}
