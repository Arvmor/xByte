"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

const THEMES = { light: "", dark: ".dark" } as const;

type ChartConfig = {
    [k in string]: {
        label?: React.ReactNode;
        icon?: React.ComponentType;
    } & (
        | { color?: string; theme?: never }
        | { color?: never; theme: Record<keyof typeof THEMES, string> }
    );
};

type ChartContextProps = {
    config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
    const context = React.useContext(ChartContext);
    if (!context) {
        throw new Error("useChart must be used within a <ChartContainer />");
    }
    return context;
}

function ChartContainer({
    id,
    className,
    children,
    config,
    style,
    ...props
}: React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
}) {
    const uniqueId = React.useId();
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

    React.useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    setDimensions({ width: rect.width, height: rect.height });
                }
            }
        };

        updateDimensions();

        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <ChartContext.Provider value={{ config }}>
            <div
                ref={containerRef}
                data-chart={chartId}
                className={cn(
                    "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none w-full text-xs",
                    className,
                )}
                style={{
                    minWidth: 0,
                    minHeight: 0,
                    position: "relative",
                    display: "block",
                    ...style,
                }}
                {...props}
            >
                <ChartStyle id={chartId} config={config} />
                {dimensions.width > 0 && dimensions.height > 0 ? (
                    <RechartsPrimitive.ResponsiveContainer
                        width={dimensions.width}
                        height={dimensions.height}
                        minWidth={0}
                        minHeight={0}
                    >
                        {children}
                    </RechartsPrimitive.ResponsiveContainer>
                ) : (
                    <div style={{ width: "100%", height: "100%", minHeight: 200 }} />
                )}
            </div>
        </ChartContext.Provider>
    );
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
    const colorConfig = Object.entries(config).filter(([, cfg]) => cfg.color || cfg.theme);

    if (!colorConfig.length) {
        return null;
    }

    return (
        <style
            dangerouslySetInnerHTML={{
                __html: Object.entries(THEMES)
                    .map(
                        ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
    .map(([key, itemConfig]) => {
        const color = itemConfig.theme?.[theme as keyof typeof THEMES] || itemConfig.color;
        return color ? `  --color-${key}: ${color};` : null;
    })
    .filter(Boolean)
    .join("\n")}
}
`,
                    )
                    .join("\n"),
            }}
        />
    );
}

const ChartTooltip = RechartsPrimitive.Tooltip;

type PayloadItem = {
    value?: string | number;
    name?: string;
    dataKey?: string | number;
    color?: string;
    payload?: Record<string, unknown>;
};

type ChartTooltipContentProps = {
    active?: boolean;
    payload?: PayloadItem[];
    label?: string;
    className?: string;
    indicator?: "line" | "dot" | "dashed";
    hideLabel?: boolean;
    hideIndicator?: boolean;
    labelFormatter?: (label: React.ReactNode, payload: PayloadItem[]) => React.ReactNode;
    labelClassName?: string;
    formatter?: (
        value: string | number,
        name: string,
        item: PayloadItem,
        index: number,
        payload: unknown,
    ) => React.ReactNode;
    color?: string;
    nameKey?: string;
    labelKey?: string;
};

function ChartTooltipContent({
    active,
    payload,
    className,
    indicator = "dot",
    hideLabel = false,
    hideIndicator = false,
    label,
    labelFormatter,
    labelClassName,
    formatter,
    color,
    nameKey,
    labelKey,
}: ChartTooltipContentProps) {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
        if (hideLabel || !payload?.length) {
            return null;
        }

        const [item] = payload;
        const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);
        const value =
            !labelKey && typeof label === "string"
                ? config[label as keyof typeof config]?.label || label
                : itemConfig?.label;

        if (labelFormatter) {
            return (
                <div className={cn("font-medium", labelClassName)}>
                    {labelFormatter(value, payload)}
                </div>
            );
        }

        if (!value) {
            return null;
        }

        return <div className={cn("font-medium", labelClassName)}>{value}</div>;
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

    if (!active || !payload?.length) {
        return null;
    }

    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
        <div
            className={cn(
                "border-border/50 bg-background grid min-w-32 items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
                className,
            )}
        >
            {!nestLabel ? tooltipLabel : null}
            <div className="grid gap-1.5">
                {payload.map((item, index) => {
                    const key = `${nameKey || item.name || item.dataKey || "value"}`;
                    const itemConfig = getPayloadConfigFromPayload(config, item, key);
                    const indicatorColor =
                        color || (item.payload as { fill?: string })?.fill || item.color;

                    return (
                        <div
                            key={item.dataKey ?? index}
                            className={cn(
                                "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                                indicator === "dot" && "items-center",
                            )}
                        >
                            {formatter && item?.value !== undefined && item.name ? (
                                formatter(item.value, item.name, item, index, item.payload)
                            ) : (
                                <>
                                    {itemConfig?.icon ? (
                                        <itemConfig.icon />
                                    ) : (
                                        !hideIndicator && (
                                            <div
                                                className={cn(
                                                    "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                                                    {
                                                        "h-2.5 w-2.5": indicator === "dot",
                                                        "w-1": indicator === "line",
                                                        "w-0 border-[1.5px] border-dashed bg-transparent":
                                                            indicator === "dashed",
                                                        "my-0.5":
                                                            nestLabel && indicator === "dashed",
                                                    },
                                                )}
                                                style={
                                                    {
                                                        "--color-bg": indicatorColor,
                                                        "--color-border": indicatorColor,
                                                    } as React.CSSProperties
                                                }
                                            />
                                        )
                                    )}
                                    <div
                                        className={cn(
                                            "flex flex-1 justify-between leading-none",
                                            nestLabel ? "items-end" : "items-center",
                                        )}
                                    >
                                        <div className="grid gap-1.5">
                                            {nestLabel ? tooltipLabel : null}
                                            <span className="text-muted-foreground">
                                                {itemConfig?.label || item.name}
                                            </span>
                                        </div>
                                        {item.value !== undefined && (
                                            <span className="text-foreground font-mono font-medium tabular-nums">
                                                {item.value.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const ChartLegend = RechartsPrimitive.Legend;

type LegendPayloadItem = {
    value?: string;
    dataKey?: string | number;
    color?: string;
};

type ChartLegendContentProps = {
    className?: string;
    hideIcon?: boolean;
    payload?: LegendPayloadItem[];
    verticalAlign?: "top" | "bottom";
    nameKey?: string;
};

function ChartLegendContent({
    className,
    hideIcon = false,
    payload,
    verticalAlign = "bottom",
    nameKey,
}: ChartLegendContentProps) {
    const { config } = useChart();

    if (!payload?.length) {
        return null;
    }

    return (
        <div
            className={cn(
                "flex items-center justify-center gap-4",
                verticalAlign === "top" ? "pb-3" : "pt-3",
                className,
            )}
        >
            {payload.map((item) => {
                const key = `${nameKey || item.dataKey || "value"}`;
                const itemConfig = getPayloadConfigFromPayload(config, item, key);

                return (
                    <div
                        key={item.value}
                        className={cn(
                            "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3",
                        )}
                    >
                        {itemConfig?.icon && !hideIcon ? (
                            <itemConfig.icon />
                        ) : (
                            <div
                                className="h-2 w-2 shrink-0 rounded-[2px]"
                                style={{ backgroundColor: item.color }}
                            />
                        )}
                        {itemConfig?.label}
                    </div>
                );
            })}
        </div>
    );
}

function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
    if (typeof payload !== "object" || payload === null) {
        return undefined;
    }

    const payloadPayload =
        "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
            ? payload.payload
            : undefined;

    let configLabelKey: string = key;

    if (
        payloadPayload &&
        key in payloadPayload &&
        typeof (payloadPayload as Record<string, unknown>)[key] === "string"
    ) {
        configLabelKey = (payloadPayload as Record<string, string>)[key];
    } else if ("dataKey" in payload && payload.dataKey !== undefined && payload.dataKey !== null) {
        configLabelKey = String(payload.dataKey);
    } else if ("name" in payload && typeof payload.name === "string") {
        configLabelKey = payload.name;
    }

    return configLabelKey in config ? config[configLabelKey] : config[key];
}

export {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    ChartStyle,
    type ChartConfig,
};
