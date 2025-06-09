import { relations } from "drizzle-orm/relations";
import { clinics, appointments, patients, doctors, users, accounts, sessions, usersToClinics } from "./schema";

export const appointmentsRelations = relations(appointments, ({one}) => ({
	clinic: one(clinics, {
		fields: [appointments.clinicId],
		references: [clinics.id]
	}),
	patient: one(patients, {
		fields: [appointments.patientId],
		references: [patients.id]
	}),
	doctor: one(doctors, {
		fields: [appointments.doctorId],
		references: [doctors.id]
	}),
}));

export const clinicsRelations = relations(clinics, ({many}) => ({
	appointments: many(appointments),
	patients: many(patients),
	doctors: many(doctors),
	usersToClinics: many(usersToClinics),
}));

export const patientsRelations = relations(patients, ({one, many}) => ({
	appointments: many(appointments),
	clinic: one(clinics, {
		fields: [patients.clinicId],
		references: [clinics.id]
	}),
}));

export const doctorsRelations = relations(doctors, ({one, many}) => ({
	appointments: many(appointments),
	clinic: one(clinics, {
		fields: [doctors.clinicId],
		references: [clinics.id]
	}),
}));

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	accounts: many(accounts),
	sessions: many(sessions),
	usersToClinics: many(usersToClinics),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const usersToClinicsRelations = relations(usersToClinics, ({one}) => ({
	user: one(users, {
		fields: [usersToClinics.userId],
		references: [users.id]
	}),
	clinic: one(clinics, {
		fields: [usersToClinics.clinicId],
		references: [clinics.id]
	}),
}));