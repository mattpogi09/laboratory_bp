import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";

export default function LineChartComponent({
    data,
    dataKey = "value",
    nameKey = "label",
    color = "#10b981",
}) {
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg border border-gray-700">
                    <p className="text-sm font-medium">
                        {payload[0].payload[nameKey]}
                    </p>
                    <p className="text-xs text-emerald-400">
                        Revenue: ₱
                        {parseFloat(payload[0].value).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                        })}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
            >
                <defs>
                    <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                        <stop
                            offset="95%"
                            stopColor={color}
                            stopOpacity={0.05}
                        />
                    </linearGradient>
                </defs>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    opacity={0.3}
                />
                <XAxis
                    dataKey={nameKey}
                    stroke="#6b7280"
                    style={{
                        fontSize: window.innerWidth < 640 ? "10px" : "12px",
                    }}
                    tickLine={false}
                    angle={window.innerWidth < 640 ? -45 : 0}
                    textAnchor={window.innerWidth < 640 ? "end" : "middle"}
                    height={window.innerWidth < 640 ? 60 : 30}
                />
                <YAxis
                    stroke="#6b7280"
                    style={{
                        fontSize: window.innerWidth < 640 ? "10px" : "12px",
                    }}
                    tickLine={false}
                    width={window.innerWidth < 640 ? 40 : 60}
                    tickFormatter={(value) => {
                        if (value >= 1000) {
                            return `₱${(value / 1000).toFixed(0)}k`;
                        }
                        return `₱${value}`;
                    }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={window.innerWidth < 640 ? 2 : 3}
                    fill="url(#colorRevenue)"
                    dot={{
                        fill: color,
                        strokeWidth: 2,
                        r: window.innerWidth < 640 ? 3 : 4,
                        stroke: "#fff",
                    }}
                    activeDot={{
                        r: window.innerWidth < 640 ? 5 : 6,
                        strokeWidth: 2,
                    }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
