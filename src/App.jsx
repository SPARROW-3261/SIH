import { useEffect, useState } from 'react';
import MetricCard from './components/MetricCard';
import RiskSummaryCard from './components/RiskSummaryCard';
import AlertPanel from './components/AlertPanel';
import StateRiskMap from './components/StateRiskMap';
import {
  summaryMetrics,
  trendData,
  alerts,
  impactStats
} from './data/mockData';

const stateCoordinates = [
  { name: 'Arunachal West', latitude: 28.2180, longitude: 94.7278 },
  { name: 'Meghalaya Hills', latitude: 25.4670, longitude: 91.3662 },
  { name: 'Nagaland Ridge', latitude: 26.1584, longitude: 94.5624 },
  { name: 'Assam Plains', latitude: 26.2006, longitude: 92.9376 },
  { name: 'Tripura Plains', latitude: 23.9408, longitude: 91.9882 },
  { name: 'Mizoram Hills', latitude: 23.1645, longitude: 92.9376 }
];

const getRiskTone = (rainfall) => {
  if (rainfall >= 30) return { tone: 'danger', label: 'Risk' };
  if (rainfall >= 15) return { tone: 'warning', label: 'Watch' };
  return { tone: 'safe', label: 'Stable' };
};

const fetchLiveStateData = async () => {
  const responses = await Promise.all(
    stateCoordinates.map(async ({ name, latitude, longitude }) => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation&timezone=auto`;
      const response = await fetch(url, { cache: 'no-store' });

      if (!response.ok) {
        throw new Error(`Failed to fetch data for ${name}`);
      }

      const data = await response.json();
      const rainfall = Number(data.current?.precipitation ?? 0);
      const temperature = Number(data.current?.temperature_2m ?? 0);
      const risk = getRiskTone(rainfall);

      return {
        name,
        rainfall,
        temperature,
        tone: risk.tone,
        risk: risk.label,
      };
    })
  );

  return responses;
};

function App() {
  const [liveStateData, setLiveStateData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [selectedState, setSelectedState] = useState('Arunachal West');

  useEffect(() => {
    let isMounted = true;

    const loadLiveData = () => {
      fetchLiveStateData()
        .then((data) => {
          if (isMounted) {
            setLiveStateData(data);
            setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            if (!data.some((item) => item.name === selectedState)) {
              setSelectedState(data[0]?.name || 'Arunachal West');
            }
          }
        })
        .catch(() => {
          if (isMounted) setLiveStateData([]);
        });
    };

    loadLiveData();
    const intervalId = setInterval(loadLiveData, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [selectedState]);

  const selectedStateData = liveStateData.find((item) => item.name === selectedState) || liveStateData[0] || {
    name: selectedState,
    rainfall: 32,
    temperature: 24,
    tone: 'warning',
    risk: 'Watch'
  };

  const selectedRiskScore = Math.min(99, Math.max(24, Math.round((selectedStateData.rainfall * 2.1) + (selectedStateData.tone === 'danger' ? 24 : selectedStateData.tone === 'warning' ? 12 : 0))));

  const liveAlerts = liveStateData.length
    ? liveStateData.map((item) => ({
        title: item.name,
        type: item.tone === 'danger' ? 'alarm' : item.tone === 'warning' ? 'watch' : 'stable',
        detail: `${item.rainfall} mm rain • ${item.temperature}°C`
      }))
    : alerts;

  const selectedTrendData = selectedStateData
    ? [
        Math.min(100, Math.max(25, selectedStateData.rainfall + 12)),
        Math.min(100, Math.max(30, selectedStateData.rainfall + 18)),
        Math.min(100, Math.max(35, selectedStateData.rainfall + 22)),
        Math.min(100, Math.max(40, selectedStateData.rainfall + 26)),
        Math.min(100, Math.max(46, selectedStateData.rainfall + 32)),
        Math.min(100, Math.max(55, selectedStateData.rainfall + 40)),
        Math.min(100, Math.max(63, selectedStateData.rainfall + 48))
      ]
    : trendData;

  const lineChartPoints = selectedTrendData.map((value, index) => {
    const x = 36 + index * 52;
    const y = 170 - value * 1.25;
    return { x, y, value };
  });

  const lineChartPath = lineChartPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const areaPath = `${lineChartPath} L ${lineChartPoints[lineChartPoints.length - 1].x} 190 L ${lineChartPoints[0].x} 190 Z`;

  const liveMetrics = liveStateData.length
    ? [
        {
          label: 'Rainfall now',
          value: `${selectedStateData.rainfall}`,
          unit: ' mm',
          trend: 'Live'
        },
        {
          label: 'Risk status',
          value: `${selectedStateData.risk}`,
          unit: '',
          trend: 'Now'
        },
        {
          label: 'Temperature',
          value: `${selectedStateData.temperature}`,
          unit: '°C',
          trend: 'Live'
        }
      ]
    : summaryMetrics;

  const liveImpactStats = liveStateData.length
    ? [
        {
          title: 'Slope failure risk',
          value: `${Math.max(24, Math.min(99, Math.round((selectedStateData.rainfall * 2.1) + (selectedStateData.tone === 'danger' ? 24 : selectedStateData.tone === 'warning' ? 12 : 0))))}%`,
          detail: `${selectedStateData.name} trigger outlook`
        },
        {
          title: 'Rainfall intensity',
          value: `${selectedStateData.rainfall} mm`,
          detail: 'Current live precipitation'
        },
        {
          title: 'Ground displacement',
          value: `${Math.max(6, Math.round(selectedStateData.rainfall / 2.8 + (selectedStateData.tone === 'danger' ? 15 : selectedStateData.tone === 'warning' ? 9 : 4)))} mm/hr`,
          detail: 'Estimated slope movement'
        }
      ]
    : impactStats;

  const selectedSidebarStress = Math.max(28, Math.min(97, Math.round(selectedStateData.rainfall * 2.2 + (selectedStateData.tone === 'danger' ? 18 : selectedStateData.tone === 'warning' ? 10 : 4))));
  const selectedSidebarBars = [
    Math.max(18, Math.min(90, selectedStateData.rainfall + 8)),
    Math.max(22, Math.min(92, selectedStateData.rainfall + 16)),
    Math.max(24, Math.min(94, selectedStateData.rainfall + 20)),
    Math.max(28, Math.min(96, selectedStateData.rainfall + 26)),
    Math.max(34, Math.min(100, selectedStateData.rainfall + 32)),
    Math.max(42, Math.min(100, selectedStateData.rainfall + 40)),
    Math.max(52, Math.min(100, selectedStateData.rainfall + 48)),
    Math.max(60, Math.min(100, selectedStateData.rainfall + 54))
  ];
  const selectedResponseValue = Math.max(44, Math.min(96, Math.round(selectedRiskScore * 0.9)));

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container nav">
          <div className="brand">
            <div className="brand-mark">N</div>
            <div>
              <span className="brand-name">NER</span>
              <small>LANDSLIDE WATCH</small>
            </div>
          </div>

          <nav>
            <a href="#overview">Overview</a>
            <a href="#dashboard">Dashboard</a>
            <a href="#risk-map">Risk Map</a>
            <a href="#solutions">AI Model</a>
            <a href="#contact">Contact</a>
          </nav>

          <button className="nav-btn">Live Alerts</button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow executive-tag">Executive summary • NER Forecast</span>
              <h1>Early Warning and Landslide Risk Monitoring System in NER</h1>
              <p>
                A real-time intelligent platform that fuses rainfall, soil moisture,
                slope movement, and terrain intelligence to predict landslides before
                they strike vulnerable communities across the North Eastern Region.
              </p>
              <div className="summary-brief">
                <span className="status-dot live" />
                {lastUpdated ? `Live feed refreshed at ${lastUpdated}` : 'Monsoon risk elevated in 3 high-priority corridors'}
              </div>

              <div className="hero-actions">
                <button className="primary-btn">View Risk Dashboard</button>
                <button className="secondary-btn">Know the Model</button>
              </div>

              <div className="metric-row">
                {liveMetrics.map((metric) => (
                  <MetricCard
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    unit={metric.unit}
                    trend={metric.trend}
                  />
                ))}
              </div>
            </div>

            <div className="hero-panel">
              <div className="panel-header">
                <span className="status-dot live" />
                Live hazard index
              </div>

              <div className="ring-wrap">
                <div className="ring">
                  <div className="ring-inner">
                    <strong>{selectedRiskScore}</strong>
                    <small>{selectedStateData.risk}</small>
                  </div>
                </div>
              </div>

              <div className="selected-state-box">
                <div className="selected-state-header">
                  <span>Selected state</span>
                  <strong>{selectedStateData.name}</strong>
                </div>
                <div className="selected-state-values">
                  <div>
                    <small>Rainfall</small>
                    <strong>{selectedStateData.rainfall} mm</strong>
                  </div>
                  <div>
                    <small>Temperature</small>
                    <strong>{selectedStateData.temperature}°C</strong>
                  </div>
                  <div>
                    <small>Status</small>
                    <strong>{selectedStateData.risk}</strong>
                  </div>
                </div>
              </div>

              <div className="summary-grid">
                {liveImpactStats.map((item) => (
                  <RiskSummaryCard
                    key={item.title}
                    title={item.title}
                    value={item.value}
                    detail={item.detail}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="overview" className="section">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">System overview</span>
              <h2>Monitoring what matters before disaster strikes</h2>
            </div>

            <div className="feature-grid">
              <div className="feature-card">
                <div className="icon">📡</div>
                <h3>Sensor Fusion</h3>
                <p>Integrates rainfall, slope movement, soil saturation, and seismic data for a faster and more precise assessment.</p>
              </div>

              <div className="feature-card">
                <div className="icon">🧠</div>
                <h3>AI Forecasting</h3>
                <p>Learns from historical event patterns and terrain susceptibility to trigger early warnings.</p>
              </div>

              <div className="feature-card">
                <div className="icon">🚨</div>
                <h3>Rapid Warning</h3>
                <p>Sends district level alerts to authorities and communities with recommended safety measures.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="dashboard" className="section alt">
          <div className="container dashboard-shell">
            <div className="section-heading left">
              <span className="eyebrow">Command dashboard</span>
              <h2>Real-time risk intelligence</h2>
            </div>

            <div className="dashboard-grid">
              <aside className="analytics-sidebar panel-box">
                <div className="panel-header">
                  <h3>Analytic pulse</h3>
                  <span>24H</span>
                </div>

                <div className="sidebar-figure">
                  <strong>{selectedSidebarStress}%</strong>
                  <small>{selectedStateData.name} slope stress</small>
                </div>

                <div className="neon-chart" aria-label="Neon risk chart">
                  {selectedSidebarBars.map((value, index) => (
                    <span key={index} style={{ height: `${Math.min(100, value)}%` }} />
                  ))}
                </div>

                <ul className="mini-metrics-list">
                  <li><span>Rainfall anomaly</span><strong>{selectedStateData.rainfall >= 30 ? '+' : ''}{Math.max(8, Math.round(selectedStateData.rainfall * 1.5))}%</strong></li>
                  <li><span>Debris flow risk</span><strong>{selectedStateData.risk}</strong></li>
                  <li><span>Sensor uptime</span><strong>{Math.max(92, 100 - Math.round(selectedStateData.rainfall / 2))}%</strong></li>
                </ul>
              </aside>

              <div className="chart-panel panel-box">
                <div className="panel-header">
                  <h3>Weekly hazard trend</h3>
                  <span>Last 7 days</span>
                </div>

                <div className="line-chart-wrap">
                  <svg viewBox="0 0 380 200" className="line-chart" preserveAspectRatio="none" aria-label="Selected state risk trend">
                    <defs>
                      <linearGradient id="lineAreaFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(90, 195, 255, 0.55)" />
                        <stop offset="100%" stopColor="rgba(90, 195, 255, 0.02)" />
                      </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#lineAreaFill)" />
                    <path d={lineChartPath} className="line-path" />
                    {lineChartPoints.map((point, index) => (
                      <circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        r={index === lineChartPoints.length - 1 ? 5 : 4}
                        className={point.value > 80 ? 'line-point danger' : 'line-point'}
                      />
                    ))}
                  </svg>

                  <div className="line-chart-labels">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                </div>
              </div>

              <AlertPanel
                alerts={liveAlerts}
                selectedState={selectedState}
                onSelectState={setSelectedState}
              />
            </div>
          </div>
        </section>

        <section id="risk-map" className="section">
          <div className="container">
            <div className="section-heading center">
              <span className="eyebrow">Regional hotspot view</span>
              <h2>North Eastern Region risk map</h2>
            </div>
            <StateRiskMap
              selectedState={selectedState}
              onSelectState={setSelectedState}
            />
          </div>
        </section>

        <section className="section admin-panel-section">
          <div className="container admin-shell">
            <div className="section-heading left">
              <span className="eyebrow">Emergency command center</span>
              <h2>Admin dashboard overview</h2>
            </div>

            <div className="admin-grid">
              <div className="admin-main panel-box">
                <div className="panel-header">
                  <h3>District response monitor</h3>
                  <span className="status-pill danger">Live</span>
                </div>

                <div className="admin-kpis">
                  <div className="admin-kpi">
                    <small>AI confidence</small>
                    <strong>{Math.max(82, Math.min(98, selectedRiskScore + 8))}%</strong>
                  </div>
                  <div className="admin-kpi">
                    <small>Risk threshold</small>
                    <strong>{selectedRiskScore}/100</strong>
                  </div>
                  <div className="admin-kpi">
                    <small>Evacuation ready</small>
                    <strong>{Math.max(5, Math.min(18, Math.round(selectedResponseValue / 7)))} blocks</strong>
                  </div>
                </div>

                <div className="response-stack">
                  <div className="response-row">
                    <span>{selectedStateData.name}</span>
                    <div className="progress"><i style={{ width: `${selectedResponseValue}%` }} /></div>
                    <strong>{selectedResponseValue}%</strong>
                  </div>
                  <div className="response-row">
                    <span>East Khasi Hills</span>
                    <div className="progress"><i style={{ width: '78%' }} /></div>
                    <strong>78%</strong>
                  </div>
                  <div className="response-row">
                    <span>Nagaland Ridge</span>
                    <div className="progress"><i style={{ width: '66%' }} /></div>
                    <strong>66%</strong>
                  </div>
                </div>
              </div>

              <div className="admin-side">
                <div className="mini-panel panel-box">
                  <div className="panel-header">
                    <h3>Response queue</h3>
                    <span>Today</span>
                  </div>
                  <ul className="queue-list">
                    <li><span className="pulse red" /> Send warning to Tawang</li>
                    <li><span className="pulse amber" /> Inspect slope crack site</li>
                    <li><span className="pulse green" /> Confirm field team status</li>
                  </ul>
                </div>

                <div className="mini-panel panel-box action-panel">
                  <div className="panel-header">
                    <h3>Quick actions</h3>
                    <span>Ops</span>
                  </div>
                  <div className="action-buttons">
                    <button>Issue alert</button>
                    <button className="ghost">Notify district</button>
                    <button className="ghost">Export report</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section ai-engine-section">
          <div className="container ai-engine-shell">
            <div className="ai-engine-panel panel-box">
              <div className="ai-header">
                <div>
                  <span className="eyebrow">AI decision engine</span>
                  <h2>Predictive risk orchestration</h2>
                </div>
                <span className="status-pill safe">Model active</span>
              </div>

              <div className="ai-grid">
                <div className="ai-logic">
                  <div className="decision-box">
                    <small>Predicted trigger window</small>
                    <strong>4h 12m</strong>
                    <p>
                      The model forecasts a high-probability landslide event in the Tawang corridor,
                      driven by sustained rainfall, slope weakening, and recent ground displacement.
                    </p>
                  </div>

                  <div className="decision-metrics">
                    <div>
                      <small>Rainfall anomaly</small>
                      <strong>+31%</strong>
                    </div>
                    <div>
                      <small>Soil saturation</small>
                      <strong>84%</strong>
                    </div>
                    <div>
                      <small>Failure probability</small>
                      <strong>89%</strong>
                    </div>
                  </div>
                </div>

                <div className="engine-stack">
                  <div className="engine-row">
                    <span>Rainfall intensity</span>
                    <strong>High</strong>
                  </div>
                  <div className="engine-row">
                    <span>Ground displacement</span>
                    <strong>Critical</strong>
                  </div>
                  <div className="engine-row">
                    <span>Terrain susceptibility</span>
                    <strong>Severe</strong>
                  </div>
                  <div className="engine-row">
                    <span>Recommended action</span>
                    <strong>Evacuate + reroute</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="solutions" className="section alt">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">AI model logic</span>
              <h2>How the early-warning intelligence works</h2>
            </div>

            <div className="workflow-grid">
              <div className="step-card">
                <span>01</span>
                <h3>Data acquisition</h3>
                <p>Rain gauges, IoT sensors, satellites, and terrain data are collected in real time.</p>
              </div>
              <div className="step-card">
                <span>02</span>
                <h3>Risk scoring</h3>
                <p>Machine learning evaluates slope instability using rainfall thresholds and soil stress patterns.</p>
              </div>
              <div className="step-card">
                <span>03</span>
                <h3>Alert generation</h3>
                <p>Warnings are ranked by severity and shared with district response teams and communities.</p>
              </div>
              <div className="step-card">
                <span>04</span>
                <h3>Action support</h3>
                <p>Response plans recommend safe routes, evacuation zones, and infrastructure protection.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section quote-section">
          <div className="container quote-box">
            <div>
              <span className="eyebrow">Impact</span>
              <h2>Protecting lives, roads, and vulnerable hill communities</h2>
            </div>
            <p>
              The NER landslide watch platform combines AI intelligence with field observations
              to reduce disaster response time and improve risk awareness before monsoon peaks.
            </p>
          </div>
        </section>
      </main>

      <footer id="contact" className="footer">
        <div className="container footer-inner">
          <div className="brand footer-brand">
            <div className="brand-mark">N</div>
            <div>
              <span className="brand-name">NER</span>
              <small>LANDSLIDE WATCH</small>
            </div>
          </div>

          <div className="footer-links">
            <a href="#overview">Overview</a>
            <a href="#dashboard">Dashboard</a>
            <a href="#risk-map">Risk Map</a>
            <a href="#solutions">AI Model</a>
          </div>

          <div className="footer-meta">Prototype concept for SIH 2026</div>
        </div>
      </footer>
    </div>
  );
}

export default App;
