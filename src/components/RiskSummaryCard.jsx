const RiskSummaryCard = ({ title, value, detail }) => {
  return (
    <div className="summary-card">
      <h4>{title}</h4>
      <strong>{value}</strong>
      <p>{detail}</p>
    </div>
  );
};

export default RiskSummaryCard;
