import { z } from 'zod';

export const updateWaitTimeSchema = z.object({
  clinicId: z.string().cuid(),
  minutes: z.number().int().min(0).max(480),
  patientsWaiting: z.number().int().min(0),
  capacity: z.number().int().min(1),
});

export const bookAppointmentSchema = z.object({
  doctorId: z.string().cuid(),
  startTime: z.string().datetime(),
  type: z.enum(['telehealth', 'in-person']),
  notes: z.string().max(500).optional(),
});

export const triageSubmissionSchema = z.object({
  answers: z.object({
    concern: z.enum(['pain', 'illness', 'skin', 'mental', 'chronic', 'other']),
    duration: z.enum(['hours', 'days', 'week', 'ongoing']),
    severity: z.enum(['mild', 'moderate', 'severe']),
  }),
  disclaimerAcked: z.boolean().refine((v) => v === true, {
    message: 'You must acknowledge the disclaimer',
  }),
});

export const signUpSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?1?\d{10,11}$/).optional(),
}).refine((data) => data.email || data.phone, {
  message: 'Either email or phone is required',
});

export type UpdateWaitTimeInput = z.infer<typeof updateWaitTimeSchema>;
export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
export type TriageSubmissionInput = z.infer<typeof triageSubmissionSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
