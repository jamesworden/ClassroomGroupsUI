import { ChartConfiguration } from 'chart.js';
import { ViewingBy } from '../configuration-visualize.component';

/**
 * Generates chart configuration options for visualization
 * @param viewingBy Whether viewing by students or groups
 * @returns Chart.js configuration options
 */
export function getChartOptions(
  viewingBy: ViewingBy
): ChartConfiguration['options'] {
  return {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 100,
    layout: {
      padding: {
        top: 10,
        right: 25,
        bottom: 10,
        left: 10,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        font: {
          family: "'Inter', sans-serif",
          size: 18,
          weight: 600,
        },
        padding: {
          top: 15,
          bottom: 25,
        },
        color: '#5c5c5c',
      },
      tooltip: {
        backgroundColor: 'rgba(20, 20, 20, 0.85)',
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: 600,
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13,
          weight: 400,
        },
        padding: 14,
        cornerRadius: 8,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 4,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        caretSize: 6,
        caretPadding: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Score',
          font: {
            family: "'Inter', sans-serif",
            size: 14,
            weight: 500,
          },
          padding: {
            bottom: 10,
          },
          color: '#6b6b6b',
        },
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(200, 200, 200, 0.15)',
          tickLength: 8,
          lineWidth: 1,
        },
        border: {
          display: false,
        },
        ticks: {
          padding: 12,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: '#757575',
        },
      },
      x: {
        title: {
          display: true,
          text: viewingBy === ViewingBy.Students ? 'Students' : 'Groups',
          font: {
            family: "'Inter', sans-serif",
            size: 14,
            weight: 500,
          },
          padding: {
            top: 15,
          },
          color: '#6b6b6b',
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          padding: 8,
          maxRotation: 45,
          minRotation: 0,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: '#757575',
          autoSkip: true,
          maxTicksLimit: 15,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3,
        fill: true,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
        hoverBorderWidth: 2,
        hitRadius: 8,
      },
      bar: {
        borderRadius: 8,
        borderSkipped: false,
        borderWidth: 0,
      },
    },
    animation: {
      duration: 700,
      easing: 'easeOutQuint',
      delay: (context) => {
        return context.dataIndex * 50;
      },
    },
    borderColor: 'transparent',
  };
}

/**
 * Creates font configuration for chart text elements
 * @param size Font size
 * @param weight Font weight
 * @returns Font configuration object
 */
export function createChartFont(size: number, weight: number = 400) {
  return {
    family: "'Inter', sans-serif",
    size,
    weight,
  };
}

/**
 * Creates chart padding configuration
 * @param top Top padding
 * @param right Right padding
 * @param bottom Bottom padding
 * @param left Left padding
 * @returns Padding configuration object
 */
export function createChartPadding(
  top: number = 0,
  right: number = 0,
  bottom: number = 0,
  left: number = 0
) {
  return {
    top,
    right,
    bottom,
    left,
  };
}
