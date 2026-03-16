import { ApexOptions } from "apexcharts";

export interface ChartStatConfig {
  title: string;
  subtitle?: string;
  value?: string | number;
  change?: string;
  changeColor?: string;
  color?: string; // Primary color
  secondaryColor?: string; // Optional secondary color (used in radar/multi-series)
  height?: number;
  width?: number;
  series: ApexOptions["series"];
  categories?: string[]; // For bar/x-axis
  labels?: string[]; // For radar chart
  totalValue?: string;
  showXLabel?: boolean;
  columnWidth?: string;
}
