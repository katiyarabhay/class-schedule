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
    dataKey: string;
    nameKey?: string;
    color?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function UtilizationChart({ title, data, type, dataKey, nameKey = 'name', color = '#8884d8' }: ChartProps) {
    return (
        <div className="glass-panel" style={{ padding: '1.5rem', height: '100%', minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--pk-text-primary)' }}>{title}</h3>
            <div style={{ flex: 1, width: '100%', minHeight: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    {type === 'bar' ? (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey={nameKey} tick={{ fill: 'var(--pk-text-muted)', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'var(--pk-text-muted)', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--pk-surface)', borderColor: 'var(--pk-border)', color: 'var(--pk-text-primary)' }}
                                itemStyle={{ color: 'var(--pk-text-primary)' }}
                            />
                            <Legend />
                            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    ) : (
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }: { name?: string; percent: number }) => `${name || 'Unknown'} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey={dataKey}
                                nameKey={nameKey}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}
