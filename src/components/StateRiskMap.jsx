import { useState } from 'react';

const stateData = [
  {
    id: 'arunachal-west',
    name: 'Arunachal West',
    risk: 'High',
    fill: '#ff5f6d',
    detail: 'Heavy rainfall and slope erosion',
    points: '130,120 215,85 295,130 282,202 204,238 134,192'
  },
  {
    id: 'assam-plains',
    name: 'Assam Plains',
    risk: 'Moderate',
    fill: '#ffb454',
    detail: 'Road cut slopes under stress',
    points: '296,128 385,144 408,220 352,290 268,250 245,188'
  },
  {
    id: 'meghalaya-hills',
    name: 'Meghalaya Hills',
    risk: 'Alert',
    fill: '#ff7b7b',
    detail: 'Severe soil saturation in plateau belts',
    points: '365,238 445,210 470,290 423,336 354,308'
  },
  {
    id: 'nagaland-ridge',
    name: 'Nagaland Ridge',
    risk: 'High',
    fill: '#ff5f6d',
    detail: 'Repeated hill-cut instability events',
    points: '215,244 295,212 330,260 290,334 228,332 188,292'
  },
  {
    id: 'mizoram-hills',
    name: 'Mizoram Hills',
    risk: 'Moderate',
    fill: '#ffb454',
    detail: 'Wet weather and weak slopes',
    points: '342,332 415,324 452,370 404,414 332,392'
  },
  {
    id: 'tripura-plains',
    name: 'Tripura Plains',
    risk: 'Low',
    fill: '#52d6a7',
    detail: 'Stable baseline with low trigger risk',
    points: '455,338 498,350 510,404 470,432 434,392'
  },
];

const getCenter = (points) => {
  const coords = points.split(' ').map((pair) => pair.split(',').map(Number));
  const total = coords.reduce(
    (acc, [x, y]) => {
      acc.x += x;
      acc.y += y;
      return acc;
    },
    { x: 0, y: 0 }
  );

  return {
    x: total.x / coords.length,
    y: total.y / coords.length
  };
};

const StateRiskMap = ({ selectedState, onSelectState }) => {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="state-map-panel">
      <div className="map-viewport">
        <svg viewBox="0 0 560 470" className="state-map-svg" role="img" aria-label="NER state risk map">
          <g>
            <path d="M30,180 C120,72 230,64 355,90 L405,115 L420,165 L390,200 L350,245 L310,265 L268,292 L230,362 L164,345 L102,300 L60,235 Z" fill="rgba(130, 160, 188, 0.08)" stroke="rgba(255,255,255,0.08)" />
            {stateData.map((state) => {
              const center = getCenter(state.points);
              const isSelected = selectedState === state.name;
              return (
                <g
                  key={state.id}
                  onClick={() => onSelectState?.(state.name)}
                  onMouseEnter={(event) => {
                    const rect = event.currentTarget.ownerSVGElement.getBoundingClientRect();
                    setHovered({
                      x: event.clientX - rect.left + 16,
                      y: event.clientY - rect.top - 18,
                      ...state
                    });
                  }}
                  onMouseMove={(event) => {
                    const rect = event.currentTarget.ownerSVGElement.getBoundingClientRect();
                    setHovered((prev) => prev ? { ...prev, x: event.clientX - rect.left + 16, y: event.clientY - rect.top - 18 } : prev);
                  }}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle className="pulse-blip" cx={center.x} cy={center.y} r={isSelected ? '30' : '26'} />
                  <polygon
                    points={state.points}
                    fill={state.fill}
                    opacity={isSelected ? '1' : '0.88'}
                    stroke={isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.28)'}
                    strokeWidth={isSelected ? '2.2' : '1.5'}
                    transform={isSelected ? 'scale(1.02)' : 'scale(1)'}
                  />
                  <text x={center.x - 18} y={center.y + 4} className="state-label">
                    {state.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {hovered && (
          <div
            className="state-tooltip"
            style={{ left: `${hovered.x}px`, top: `${hovered.y}px` }}
          >
            <strong>{hovered.name}</strong>
            <span>{hovered.risk}</span>
            <small>{hovered.detail}</small>
          </div>
        )}
      </div>

      <div className="state-list">
        {stateData.map((state) => (
          <div
            key={state.id}
            className={`state-pill-row ${selectedState === state.name ? 'selected' : ''}`}
            onClick={() => onSelectState?.(state.name)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelectState?.(state.name);
              }
            }}
          >
            <span className="state-dot" style={{ background: state.fill }} />
            <span>{state.name}</span>
            <strong>{state.risk}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StateRiskMap;
