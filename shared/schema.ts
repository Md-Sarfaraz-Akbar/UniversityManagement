import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["student", "faculty", "admin"] }).notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  instructorId: integer("instructor_id")
    .references(() => users.id)
    .notNull(),
  credits: integer("credits").notNull(),
});

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .references(() => users.id)
    .notNull(),
  courseId: integer("course_id")
    .references(() => courses.id)
    .notNull(),
  grade: text("grade", { 
    enum: ["A", "B", "C", "D", "F", "IP"] // IP = In Progress
  }).default("IP"),
  attendance: numeric("attendance").default("0"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .references(() => users.id)
    .notNull(),
  amount: numeric("amount").notNull(),
  description: text("description").notNull(),
  status: text("status", { enum: ["pending", "completed", "failed"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create schemas
export const insertUserSchema = createInsertSchema(users);
export const insertCourseSchema = createInsertSchema(courses);
export const insertEnrollmentSchema = createInsertSchema(enrollments);
export const insertPaymentSchema = createInsertSchema(payments);

// Update grade schema
export const updateGradeSchema = z.object({
  grade: z.enum(["A", "B", "C", "D", "F", "IP"]),
  attendance: z.number().min(0).max(100),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type UpdateGrade = z.infer<typeof updateGradeSchema>;