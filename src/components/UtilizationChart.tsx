'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

interface ChartProps {
    title: string;
    data: any[];
    type: 'bar' | 'pie';
    dataKey: string | string[];
    nameKey?: string;
    color?: string | string[];
    layout?: 'horizontal' | 'vertical';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function UtilizationChart({ title, data, type, dataKey, nameKey = 'name', color = '#8884d8', xAxisLabel, yAxisLabel, layout = 'horizontal', barSize = 30 }: ChartProps & { xAxisLabel?: string, yAxisLabel?: string, layout?: 'horizontal' | 'vertical', barSize?: number }) {
    const dataKeys = Array.isArray(dataKey) ? dataKey : [dataKey];
    const barColors = Array.isArray(color) ? color : [color, '#82ca9d', '#ffc658'];

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', height: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--pk-text-primary)' }}>{title}</h3>
            <div style={{ flex: 1, width: '100%', minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    {type === 'bar' ? (
                        <BarChart
                            data={data}
                            layout={layout}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={layout === 'vertical'} vertical={layout === 'horizontal'} />
                            {layout === 'horizontal' ? (
                                <>
                                    <XAxis
                                        dataKey={nameKey}
                                        tick={{ fill: 'var(--pk-text-muted)', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={{ stroke: 'var(--pk-border)' }}
                                        label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10, fill: 'var(--pk-text-muted)' } : undefined}
                                    />
                                    <YAxis
                                        tick={{ fill: 'var(--pk-text-muted)', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--pk-text-muted)' } : undefined}
                                    />
                                </>
                            ) : (
                                <>
                                    <XAxis
                                        type="number"
                                        tick={{ fill: 'var(--pk-text-muted)', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={{ stroke: 'var(--pk-border)' }}
                                        label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10, fill: 'var(--pk-text-muted)' } : undefined}
                                    />
                                    <YAxis
                                        dataKey={nameKey}
                                        type="category"
                                        width={100}
                                        tick={{ fill: 'var(--pk-text-muted)', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--pk-text-muted)' } : undefined}
                                    />
                                </>
                            )}
                            <Tooltip
                                cursor={{ fill: 'var(--pk-surface)', opacity: 0.5 }}
                                contentStyle={{
                                    backgroundColor: 'var(--pk-surface)',
                                    borderColor: 'var(--pk-border)',
                                    color: 'var(--pk-text-primary)',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                itemStyle={{ color: 'var(--pk-text-primary)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            {dataKeys.map((key, index) => (
                                <Bar
                                    key={key}
                                    dataKey={key}
                                    name={key.charAt(0).toUpperCase() + key.slice(1)} // Capitalize for legend
                                    fill={barColors[index % barColors.length]}
                                    radius={layout === 'horizontal' ? [4, 4, 0, 0] : [0, 4, 4, 0]}
                                    barSize={barSize}
                                />
                            ))}
                        </BarChart>
                    ) : (
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }: { name?: string; percent?: number }) => `${name || 'Unknown'} ${((percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={100}
                                innerRadius={60}
                                paddingAngle={5}
                                dataKey={dataKeys[0]}
                                nameKey={nameKey}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="var(--pk-background)" strokeWidth={2} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--pk-surface)',
                                    borderColor: 'var(--pk-border)',
                                    color: 'var(--pk-text-primary)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}
