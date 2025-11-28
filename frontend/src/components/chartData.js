// chartData.js
/**
 * Tạo chart data cho Chart.js từ devices
 * @param {Array} devices - danh sách devices đã filter
 * @param {String} type - loại chart: 'bar' | 'line' | 'pie'
 * @returns {Object} chartData phù hợp với Chart.js
 */
export const generateChartData = (devices, type = "bar") => {
  if (!devices || devices.length === 0) {
    return { labels: [], datasets: [] };
  }

  const colors = devices.map(
    (d) => d.color || "#" + Math.floor(Math.random() * 16777215).toString(16)
  );

  switch (type) {
    case "line":
      return {
        labels: devices.map((d) => d.DEVICE_NAME),
        datasets: [
          {
            label: "kWh",
            data: devices.map((d) => d.kWh || 0),
            borderColor: colors,
            backgroundColor: "transparent",
            tension: 0.3,
            fill: false,
          },
        ],
      };

    case "pie":
      return {
        labels: devices.map((d) => d.DEVICE_NAME),
        datasets: [
          {
            label: "kWh",
            data: devices.map((d) => d.kWh || 0),
            backgroundColor: colors,
            borderColor: "#fff",
            borderWidth: 1,
          },
        ],
      };

    case "bar":
    default:
      return {
        labels: devices.map((d) => d.DEVICE_NAME),
        datasets: [
          {
            label: "kWh",
            data: devices.map((d) => d.kWh || 0),
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 2,
          },
        ],
      };
  }
};
