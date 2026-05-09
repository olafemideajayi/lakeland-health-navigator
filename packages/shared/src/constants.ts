export const SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Orthopedics',
  'Psychiatry',
  'Neurology',
  'Gastroenterology',
  'Rheumatology',
] as const;

export const LAKELAND_CITIES = [
  'Cold Lake',
  'Bonnyville',
  'Lac La Biche',
  'St. Paul',
] as const;

export const TRIAGE_LEVELS = {
  EMERGENCY: { label: 'Emergency', color: '#DC3545', priority: 1 },
  URGENT: { label: 'Urgent Care', color: '#FF6B35', priority: 2 },
  WALK_IN: { label: 'Walk-in Clinic', color: '#D4A017', priority: 3 },
  TELEHEALTH: { label: 'Telehealth', color: '#0066CC', priority: 4 },
  SELF_CARE: { label: 'Self-Care', color: '#00A86B', priority: 5 },
} as const;

export const APPOINTMENT_DURATION_MINUTES = 30;

export const HEALTH_LINK_NUMBER = '811';
