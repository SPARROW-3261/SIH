export const summaryMetrics = [
  { label: 'High-risk zones', value: 32, unit: '', trend: '+5%' },
  { label: 'NER states', value: 6, unit: '', trend: '+1' },
  { label: 'Avg. alert lead', value: 18, unit: ' min', trend: '-4 min' }
];

export const trendData = [35, 42, 52, 61, 74, 88, 91];

export const regionalRisk = [
  { name: 'Arunachal', level: 'high', position: 'p1' },
  { name: 'Meghalaya', level: 'moderate', position: 'p2' },
  { name: 'Nagaland', level: 'high', position: 'p3' },
  { name: 'Assam', level: 'alert', position: 'p4' },
  { name: 'Tripura', level: 'low', position: 'p5' },
  { name: 'Mizoram', level: 'moderate', position: 'p6' }
];

export const alerts = [
  {
    title: 'Meghalaya Hills',
    type: 'watch',
    detail: 'Heavy rainfall + slope cracking'
  },
  {
    title: 'Arunachal corridor',
    type: 'alarm',
    detail: 'Road access risk elevated'
  },
  {
    title: 'Tripura plains',
    type: 'stable',
    detail: 'Below trigger threshold'
  }
];

export const impactStats = [
  { title: 'Slope failure risk', value: '72%', detail: 'Analyzed across hotspot clusters' },
  { title: 'Rainfall intensity', value: '134 mm', detail: 'Monsoon surge in active zones' },
  { title: 'Ground displacement', value: '12 mm/hr', detail: 'Velocity trend above warning threshold' }
];
