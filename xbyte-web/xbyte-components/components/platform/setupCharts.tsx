"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const vaultEarningsData = [
    { month: "Jan", earnings: 0, potential: 2400 },
    { month: "Feb", earnings: 0, potential: 4100 },
    { month: "Mar", earnings: 0, potential: 6800 },
    { month: "Apr", earnings: 0, potential: 9200 },
    { month: "May", earnings: 0, potential: 12500 },
    { month: "Jun", earnings: 0, potential: 16800 },
];

const storageData = [
    { name: "Videos", size: 450, files: 120 },
    { name: "Audio", size: 180, files: 340 },
    { name: "Documents", size: 85, files: 890 },
    { name: "Images", size: 120, files: 2100 },
];

const vaultChartConfig = {
    earnings: {
        label: "Current Earnings",
        color: "#9CA3AF",
    },
    potential: {
        label: "Potential (USDC)",
        color: "#374151",
    },
} satisfies ChartConfig;

const storageChartConfig = {
    size: {
        label: "Size (GB)",
        color: "#374151",
    },
    files: {
        label: "Files",
        color: "#9CA3AF",
    },
} satisfies ChartConfig;

function VaultEarningsChart() {
    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div>
                        <CardTitle className="text-base">Set Up Vault</CardTitle>
                        <CardDescription>Receive on-chain payments</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={vaultChartConfig} className="h-[200px] w-full">
                    <AreaChart accessibilityLayer data={vaultEarningsData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(v) => `$${v / 1000}k`}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(value, name) =>
                                        value != null ? (
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-muted-foreground">{name}</span>
                                                <span className="font-mono font-medium">
                                                    ${Number(value).toLocaleString()}
                                                </span>
                                            </div>
                                        ) : null
                                    }
                                />
                            }
                        />
                        <ChartLegend content={<ChartLegendContent />} verticalAlign="bottom" />
                        <defs>
                            <linearGradient id="fillPotential" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-potential)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-potential)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey="potential"
                            type="monotone"
                            fill="url(#fillPotential)"
                            stroke="var(--color-potential)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

function StorageConnectionChart() {
    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div>
                        <CardTitle className="text-base">Connect Storage</CardTitle>
                        <CardDescription>Link your data providers</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={storageChartConfig} className="h-[200px] w-full">
                    <BarChart accessibilityLayer data={storageData} layout="vertical">
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                        <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={80}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(value, name) =>
                                        value != null ? (
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-muted-foreground">{name}</span>
                                                <span className="font-mono font-medium">
                                                    {name === "Size (GB)"
                                                        ? `${value} GB`
                                                        : `${Number(value).toLocaleString()} files`}
                                                </span>
                                            </div>
                                        ) : null
                                    }
                                />
                            }
                        />
                        <ChartLegend content={<ChartLegendContent />} verticalAlign="bottom" />
                        <Bar dataKey="size" fill="var(--color-size)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export { VaultEarningsChart, StorageConnectionChart };
