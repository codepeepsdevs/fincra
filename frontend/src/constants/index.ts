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

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "top" as const,
    },
    tooltip: {
      mode: "index" as const,
      intersect: false,
    },
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: "Date",
      },
    },
    y: {
      display: true,
      title: {
        display: true,
        text: "Conversion Amount",
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
