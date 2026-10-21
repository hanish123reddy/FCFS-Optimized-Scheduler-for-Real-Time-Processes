import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Chart JS global defaults for premium look
ChartJS.defaults.color = '#A1A1AA';
ChartJS.defaults.font.family = "'Inter', sans-serif";

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#111827',
      titleColor: '#FFFFFF',
      bodyColor: '#A1A1AA',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      padding: 12,
      boxPadding: 6,
      usePointStyle: true,
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        padding: 10,
      }
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
        drawBorder: false,
      },
      border: { dash: [4, 4] },
      ticks: {
        padding: 10,
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
};

export const PremiumLineChart = ({ data, color = '#3B82F6' }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: data.label || 'Value',
        data: data.values,
        borderColor: color,
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: color,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, `${color}40`); // 25% opacity
          gradient.addColorStop(1, `${color}00`); // 0% opacity
          return gradient;
        },
        fill: true,
      }
    ]
  };

  return <Line options={commonOptions} data={chartData} />;
};

export const MultiLineTrendChart = ({ labels, datasets }) => {
  const options = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#A1A1AA',
          boxWidth: 10,
          usePointStyle: true,
          font: { size: 11, family: "'Inter', sans-serif" }
        }
      }
    }
  };

  const chartData = {
    labels,
    datasets: datasets.map(ds => ({
      label: ds.label,
      data: ds.data,
      borderColor: ds.color,
      backgroundColor: `${ds.color}15`,
      borderWidth: 2,
      tension: 0.35,
      pointRadius: 3,
      pointHoverRadius: 6,
      fill: ds.fill || false,
    }))
  };

  return <Line options={options} data={chartData} />;
};

export const PremiumBarChart = ({ data, color = '#8B5CF6' }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: data.label || 'Value',
        data: data.values,
        backgroundColor: color,
        borderRadius: 4,
        borderSkipped: false,
        barThickness: 12,
      }
    ]
  };

  return <Bar options={commonOptions} data={chartData} />;
};

export const ComparisonBarChart = ({ labels, datasets }) => {
  const options = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#A1A1AA',
          boxWidth: 12,
          usePointStyle: true,
          font: { size: 12, family: "'Inter', sans-serif" }
        }
      }
    },
    scales: {
      ...commonOptions.scales,
      x: {
        grid: { display: false },
        ticks: { color: '#A1A1AA', font: { size: 12 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#A1A1AA', font: { size: 12 } }
      }
    }
  };

  const data = {
    labels: labels,
    datasets: datasets.map(ds => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: ds.color,
      borderRadius: 6,
      borderSkipped: false,
      maxBarThickness: 28,
    }))
  };

  return <Bar options={options} data={data} />;
};

export const PremiumDoughnutChart = ({ labels, data, colors, title }) => {
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#A1A1AA',
          boxWidth: 12,
          usePointStyle: true,
          font: { size: 11, family: "'Inter', sans-serif" },
          padding: 14
        }
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#FFFFFF',
        bodyColor: '#A1A1AA',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 6,
        usePointStyle: true,
      }
    },
    cutout: '68%',
  };

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: colors || ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'],
        borderWidth: 0,
        hoverOffset: 6,
      }
    ]
  };

  return <Doughnut options={doughnutOptions} data={chartData} />;
};

export const AlgorithmRadarChart = ({ datasets }) => {
  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#A1A1AA',
          boxWidth: 12,
          usePointStyle: true,
          font: { size: 11, family: "'Inter', sans-serif" },
          padding: 12
        }
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#FFFFFF',
        bodyColor: '#A1A1AA',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
      }
    },
    scales: {
      r: {
        grid: {
          color: 'rgba(255, 255, 255, 0.08)',
        },
        angleLines: {
          color: 'rgba(255, 255, 255, 0.08)',
        },
        pointLabels: {
          color: '#D1D5DB',
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: '600'
          }
        },
        ticks: {
          display: false,
          maxTicksLimit: 5,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      }
    }
  };

  const labels = [
    'Waiting Efficiency',
    'Turnaround Efficiency',
    'Fairness Index',
    'CPU Utilization',
    'Throughput Score'
  ];

  const chartData = {
    labels,
    datasets: datasets.map(ds => ({
      label: ds.label,
      data: ds.data,
      borderColor: ds.color,
      backgroundColor: `${ds.color}25`,
      borderWidth: 2,
      pointBackgroundColor: ds.color,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: ds.color,
      pointRadius: 3
    }))
  };

  return <Radar options={radarOptions} data={chartData} />;
};

export const PredictionVsActualChart = ({ labels, actualData, predictedData }) => {
  const options = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#A1A1AA',
          boxWidth: 12,
          usePointStyle: true,
          font: { size: 12, family: "'Inter', sans-serif" }
        }
      },
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          afterBody: (context) => {
            const index = context[0].dataIndex;
            const actual = actualData[index];
            const predicted = predictedData[index];
            const err = Math.abs(actual - predicted).toFixed(2);
            return `Residual Error: ±${err}s`;
          }
        }
      }
    },
    scales: {
      ...commonOptions.scales,
      x: {
        grid: { display: false },
        ticks: { color: '#A1A1AA', maxRotation: 45, minRotation: 20, font: { size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#A1A1AA',
          callback: (value) => `${value}s`
        }
      }
    }
  };

  const chartData = {
    labels: labels || [],
    datasets: [
      {
        label: 'Actual Ground Truth (s)',
        data: actualData || [],
        backgroundColor: '#06B6D4CC',
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.8
      },
      {
        label: 'ML Model Predicted (s)',
        data: predictedData || [],
        backgroundColor: '#A855F7CC',
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.8
      }
    ]
  };

  return <Bar options={options} data={chartData} />;
};

export const SensitivityMultiLineChart = ({ labels, data, xTitle = "Feature Scale", color = "#8B5CF6" }) => {
  const options = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { display: false },
        title: {
          display: true,
          text: xTitle,
          color: '#71717A',
          font: { size: 11, family: "'Inter', sans-serif" }
        },
        ticks: { color: '#A1A1AA', font: { size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        title: {
          display: true,
          text: 'Predicted Burst Time (s)',
          color: '#71717A',
          font: { size: 11, family: "'Inter', sans-serif" }
        },
        ticks: {
          color: '#A1A1AA',
          callback: (value) => `${value}s`
        }
      }
    }
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Predicted Burst Time',
        data,
        borderColor: color,
        borderWidth: 2.5,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: color,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 260);
          gradient.addColorStop(0, `${color}40`);
          gradient.addColorStop(1, `${color}00`);
          return gradient;
        },
        fill: true,
      }
    ]
  };

  return <Line options={options} data={chartData} />;
};
