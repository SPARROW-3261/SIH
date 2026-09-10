const MetricCard = ({ label, value, unit, trend }) => {
  return (
    <div className="metric-card">
      <strong>{value}{unit}</strong>
      <span>{label}</span>
      <small>{trend}</small>
    </div>
  );
};

export default MetricCard;
