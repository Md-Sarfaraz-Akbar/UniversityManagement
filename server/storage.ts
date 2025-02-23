import { IStorage } from "./storage";
import createMemoryStore from "memorystore";
import session from "express-session";
import {
  User,
  InsertUser,
  Course,
  InsertCourse,
  Enrollment,
  InsertEnrollment,
  Payment,
  InsertPayment,
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private enrollments: Map<number, Enrollment>;
  private payments: Map<number, Payment>;
  private currentId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.enrollments = new Map();
    this.payments = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentId++;
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const id = this.currentId++;
    const newCourse = { ...course, id };
    this.courses.set(id, newCourse);
    return newCourse;
  }

  async getEnrollmentsByUser(userId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      (enrollment) => enrollment.studentId === userId,
    );
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const id = this.currentId++;
    const newEnrollment = { ...enrollment, id };
    this.enrollments.set(id, newEnrollment);
    return newEnrollment;
  }

  async getPaymentsByUser(userId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.studentId === userId,
    );
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.currentId++;
    const newPayment = { ...payment, id };
    this.payments.set(id, newPayment);
    return newPayment;
  }
}

export const storage = new MemStorage();
