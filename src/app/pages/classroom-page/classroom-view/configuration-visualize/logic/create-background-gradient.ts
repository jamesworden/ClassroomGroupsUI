import { ChartType } from 'chart.js';

/**
 * Creates the appropriate background gradient for the chart
 *
 * @param chartType The type of chart being displayed
 * @param isGroupData Whether this is for group data (uses different colors)
 */
export function createBackgroundGradient(
  chartType: ChartType,
  isGroupData = false
) {
  // For student data (blue colors)
  const baseColor = isGroupData
    ? { r: 137, g: 111, b: 255 } // Purple for groups
    : { r: 94, g: 129, b: 244 }; // Blue for students

  return (context: any) => {
    const chart = context.chart;
    const { ctx, chartArea } = chart;

    if (!chartArea) {
      return `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.8)`;
    }

    // Create gradient based on chart type
    if (chartType === 'bar') {
      const gradient = ctx.createLinearGradient(
        0,
        chartArea.bottom,
        0,
        chartArea.top
      );
      gradient.addColorStop(
        0,
        `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.2)`
      );
      gradient.addColorStop(
        1,
        `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.8)`
      );
      return gradient;
    } else if (chartType === 'line') {
      const gradient = ctx.createLinearGradient(
        0,
        chartArea.bottom,
        0,
        chartArea.top
      );
      gradient.addColorStop(
        0,
        `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.1)`
      );
      gradient.addColorStop(
        1,
        `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.6)`
      );
      return gradient;
    } else {
      return `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.7)`;
    }
  };
}
