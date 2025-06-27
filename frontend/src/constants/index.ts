import { ChartOptions, ScriptableChartContext } from "chart.js";
import { IoBarChart } from "react-icons/io5";
import { IconType } from "react-icons/lib";
import { TbExchange } from "react-icons/tb";

interface SideBarMenuData {
  id: number;
  title: string;
  icon: IconType;
  path: string;
}

export const sideBarMenuData: SideBarMenuData[] = [
  {
    id: 1,
    title: "Overview",
    icon: IoBarChart,
    path: "/overview",
  },
  {
    id: 2,
    title: "Conversion",
    icon: TbExchange,
    path: "/conversion",
  },
];

export const periodOptions = [
  { value: "7d", label: "7 Days" },
  { value: "1m", label: "1 Month" },
  { value: "6m", label: "6 Months" },
  { value: "1y", label: "1 Year" },
];

export const currencyColors = {
  USD: "#10B981",
  EUR: "#3B82F6",
  GBP: "#8B5CF6",
  NGN: "#F59E0B",
};

export const chartOptions: ChartOptions<any> = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
  },
  plugins: {
    legend: {
      display: true,
      position: "top" as const,
      labels: {
        font: (ctx: ScriptableChartContext) => {
          const width = ctx.chart.width;
          return {
            size: width < 500 ? 10 : 12,
            weight: "bold",
          };
        },
        boxWidth: 16,
        boxHeight: 8,
        padding: 12,
      },
    },
    tooltip: {
      mode: "index",
      intersect: false,
      bodyFont: {
        size: 12,
      },
      titleFont: {
        size: 13,
      },
      padding: 10,
    },
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: "Date",
        font: (ctx: ScriptableChartContext) => {
          const width = ctx.chart.width;
          return {
            size: width < 500 ? 11 : 15,
            weight: "bold",
          };
        },
      },
      ticks: {
        font: (ctx: ScriptableChartContext) => {
          const width = ctx.chart.width;
          return {
            size: width < 500 ? 10 : 11,
          };
        },
        maxRotation: 0,
        autoSkip: true,
        padding: 4,
      },
    },
    y: {
      display: true,
      title: {
        display: true,
        text: "Conversion Amount",
        font: (ctx: ScriptableChartContext) => {
          const width = ctx.chart.width;
          return {
            size: width < 500 ? 11 : 15,
            weight: "bold",
          };
        },
      },
      ticks: {
        font: (ctx: any) => {
          const width = ctx.chart.width;
          return {
            size: width < 500 ? 10 : 11,
            weight: "bold",
          };
        },
        padding: 4,
      },
      beginAtZero: true,
    },
  },
  interaction: {
    mode: "nearest" as const,
    axis: "x" as const,
    intersect: false,
  },
};
