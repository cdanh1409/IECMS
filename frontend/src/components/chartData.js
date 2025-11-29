export const generateChartData = (devices, type = "bar") => {
  if (!devices || devices.length === 0) return { labels: [], datasets: [] };

  const colors = devices.map((d) => d.color || "#007bff");

  switch (type) {
    case "line":
      return {
        labels: devices.map((d) => d.DEVICE_NAME),
        datasets: [
          {
            label: "kWh",
            data: devices.map((d) => d.totalKWh || 0),
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
            data: devices.map((d) => d.totalKWh || 0),
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
            data: devices.map((d) => d.totalKWh || 0),
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 2,
          },
        ],
      };
  }
};
