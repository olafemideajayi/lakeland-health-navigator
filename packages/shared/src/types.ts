export interface ClinicWithWaitTime {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  hours: Record<string, { open: string; close: string }>;
  services: string[];
  walkInOpen: boolean;
  telehealthOpen: boolean;
  currentWait: {
    minutes: number;
    patientsWaiting: number;
    capacity: number;
    updatedAt: string;
  } | null;
}

export interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  bio: string | null;
  photoUrl: string | null;
  rating: number;
  ratingCount: number;
  telehealth: boolean;
  onDuty: boolean;
  nextAvailable: string | null;
}

export interface TriageResult {
  level: 'EMERGENCY' | 'URGENT' | 'WALK_IN' | 'TELEHEALTH' | 'SELF_CARE';
  recommendation: string;
  venue: string;
  estimatedWait: string | null;
}

export interface StaffDashboardStats {
  patientsSeenToday: number;
  telehealthRedirects: number;
  erDiversions: number;
  averageWaitMinutes: number;
}

export interface QueueEntryView {
  id: string;
  position: number;
  patientName: string;
  reason: string;
  triageLevel: string;
  waitingSince: string;
}

export interface WaitTimeUpdate {
  clinicId: string;
  minutes: number;
  patientsWaiting: number;
  capacity: number;
  updatedAt: string;
}
