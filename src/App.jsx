import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";

import { useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";

import "./App.css";

/* Register all chart components */
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

function App() {
  const [metrics, setMetrics] = useState({ cpu: 0, memory: 0, disk: 0 });
  const [cpuHistory, setCpuHistory] = useState([]);
  const [memoryHistory, setMemoryHistory] = useState([]);
  const [diskHistory, setDiskHistory] = useState([]);

  const fetchMetrics = async () => {
    try {
      const res = await fetch(
        "https://i2k328n5yh.execute-api.ap-south-1.amazonaws.com/metrics"
      );
      const data = await res.json();

      setMetrics(data);
      setCpuHistory((prev) => [...prev.slice(-14), data.cpu]);
      setDiskHistory((prev) => [...prev.slice(-14), data.disk]);
      setMemoryHistory((prev) => [...prev.slice(-14), data.memory]);
    } catch (err) {
      console.error("API error:", err);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  const chart = (label, values, color) => {
    const limited = values.slice(-4);

    return {
      labels: limited.map((_, i) => `T${i + 1}`),
      datasets: [
        {
          label,
          data: limited,
          borderColor: color,
          borderWidth: 1,
          tension: 0.5,
        },
      ],
    };
  };

  return (
    <div className="dashboard-frame">
      <h1 className="dashboard-title">InfraWatch</h1>
      {/* TOP CARDS */}
      <div className="card-row">
        <Card title="CPU Usage" value={metrics.cpu} />
        <Card title="Disk Usage" value={metrics.disk} />
        <Card title="Memory Usage" value={metrics.memory} />
      </div>

      {/* CHARTS */}
      <div className="chart-grid">
        <div className="chart-box">
          <h2>CPU Usage</h2>
          <Line data={chart("CPU %", cpuHistory, "#22dd88")} />
        </div>

        <div className="chart-box">
          <h2>Disk Usage</h2>
          <Doughnut
            data={{
              labels: ["Used", "Free"],
              datasets: [
                {
                  data: [
                    diskHistory.slice(-1)[0],
                    100 - diskHistory.slice(-1)[0],
                  ],
                  backgroundColor: ["#ef4141ff", "#494949ff"],
                },
              ],
            }}
          />
        </div>

        <div className="chart-box">
          <h2>Memory Usage</h2>
          <Bar data={chart("Memory %", memoryHistory, "#4dabf7")} />
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="card">
      <h3 style={{ color: "white" }}>{title}</h3>
      <div className="card-value" style={{ color: "white" }}>
        {value}%
      </div>
    </div>
  );
}

export default App;
