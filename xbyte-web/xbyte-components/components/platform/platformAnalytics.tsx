"use client";

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const revenueData = [
    { month: "Jan", revenue: 12400, projected: 15000 },
    { month: "Feb", revenue: 18200, projected: 20000 },
    { month: "Mar", revenue: 24800, projected: 25000 },
    { month: "Apr", revenue: 31500, projected: 32000 },
    { month: "May", revenue: 42300, projected: 40000 },
    { month: "Jun", revenue: 58100, projected: 55000 },
];

const consumptionData = [
    { month: "Jan", video: 2400, audio: 1200, data: 800 },
    { month: "Feb", video: 3100, audio: 1500, data: 950 },
    { month: "Mar", video: 4200, audio: 1900, data: 1100 },
    { month: "Apr", video: 5800, audio: 2300, data: 1350 },
    { month: "May", video: 7200, audio: 2800, data: 1600 },
    { month: "Jun", video: 9100, audio: 3400, data: 1900 },
];

const distributionData = [
    { name: "Video Streaming", value: 45, fill: "var(--color-video)" },
    { name: "Audio Content", value: 28, fill: "var(--color-audio)" },
    { name: "Live Events", value: 15, fill: "var(--color-live)" },
    { name: "Data Files", value: 12, fill: "var(--color-data)" },
];

const revenueConfig = {
    revenue: {
        label: "Revenue (USDC)",
        color: "#374151",
    },
    projected: {
        label: "Projected",
        color: "#9CA3AF",
    },
} satisfies ChartConfig;

const consumptionConfig = {
    video: {
        label: "Video (TB)",
        color: "#1F2937",
    },
    audio: {
        label: "Audio (TB)",
        color: "#6B7280",
    },
    data: {
        label: "Data (TB)",
        color: "#D1D5DB",
    },
} satisfies ChartConfig;

const distributionConfig = {
    video: {
        label: "Video Streaming",
        color: "#1F2937",
    },
    audio: {
        label: "Audio Content",
        color: "#4B5563",
    },
    live: {
        label: "Live Events",
        color: "#9CA3AF",
    },
    data: {
        label: "Data Files",
        color: "#D1D5DB",
    },
} satisfies ChartConfig;

function RevenueChart() {
    return (
        <Card className="flex-1">
            <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
                <CardDescription>Monthly earnings vs projected revenue</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={revenueConfig} className="h-[250px] w-full">
                    <AreaChart accessibilityLayer data={revenueData}>
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
                                                <span className="text-muted-foreground">
                                                    {name}
                                                </span>
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
                            <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-revenue)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-revenue)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient id="fillProjected" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-projected)"
                                    stopOpacity={0.4}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-projected)"
                                    stopOpacity={0.05}
                                />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey="projected"
                            type="monotone"
                            fill="url(#fillProjected)"
                            stroke="var(--color-projected)"
                            strokeDasharray="4 4"
                            strokeWidth={2}
                        />
                        <Area
                            dataKey="revenue"
                            type="monotone"
                            fill="url(#fillRevenue)"
                            stroke="var(--color-revenue)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

function ConsumptionChart() {
    return (
        <Card className="flex-1">
            <CardHeader>
                <CardTitle>Data Consumption</CardTitle>
                <CardDescription>Bytes streamed by content type</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={consumptionConfig} className="h-[250px] w-full">
                    <BarChart accessibilityLayer data={consumptionData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(v) => `${v / 1000}k`}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(value, name) =>
                                        value != null ? (
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-muted-foreground">
                                                    {name}
                                                </span>
                                                <span className="font-mono font-medium">
                                                    {Number(value).toLocaleString()} TB
                                                </span>
                                            </div>
                                        ) : null
                                    }
                                />
                            }
                        />
                        <ChartLegend content={<ChartLegendContent />} verticalAlign="bottom" />
                        <Bar dataKey="video" fill="var(--color-video)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="audio" fill="var(--color-audio)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="data" fill="var(--color-data)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

function DistributionChart() {
    return (
        <Card className="flex-1">
            <CardHeader>
                <CardTitle>Content Distribution</CardTitle>
                <CardDescription>Platform usage by content type</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={distributionConfig} className="h-[250px] w-full">
                    <PieChart>
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(value, name) =>
                                        value != null ? (
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-muted-foreground">
                                                    {name}
                                                </span>
                                                <span className="font-mono font-medium">
                                                    {value}%
                                                </span>
                                            </div>
                                        ) : null
                                    }
                                />
                            }
                        />
                        <Pie
                            data={distributionData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            strokeWidth={2}
                            stroke="var(--background)"
                        >
                            {distributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <ChartLegend
                            content={<ChartLegendContent nameKey="name" />}
                            verticalAlign="bottom"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export interface PlatformAnalyticsProps {
    className?: string;
}

export default function PlatformAnalytics({ className }: PlatformAnalyticsProps) {
    return (
        <div className={className}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <RevenueChart />
                <ConsumptionChart />
                <DistributionChart />
            </div>
        </div>
    );
}

export { RevenueChart, ConsumptionChart, DistributionChart };
