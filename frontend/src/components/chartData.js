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

  // Màu cố định: nếu device.color đã có thì dùng, nếu chưa có thì gán 1 màu mặc định
  const colors = devices.map((d) => d.color || "#007bff");

  switch (type) {
    case "line":
      return {
        labels: devices.map((d) => d.DEVICE_NAME),
        datasets: [
          {
            label: "kWh",
            data: devices.map((d) => d.kWh || 0), // dùng kWh
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
