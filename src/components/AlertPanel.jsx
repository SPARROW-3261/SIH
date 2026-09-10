const AlertPanel = ({ alerts, selectedState, onSelectState }) => {
  return (
    <div className="alert-panel">
      <div className="panel-header">
        <h3>Alert levels</h3>
        <span className="status-pill danger">High</span>
      </div>

      <ul className="alerts-list">
        {alerts.map((alert) => (
          <li
            key={alert.title}
            className={`alert-item ${selectedState === alert.title ? 'selected' : ''}`}
            onClick={() => onSelectState?.(alert.title)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelectState?.(alert.title);
              }
            }}
          >
            <span className={`tag ${alert.type}`}>{alert.type}</span>
            <div>
              <strong>{alert.title}</strong>
              <small>{alert.detail}</small>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AlertPanel;
