import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertCourseSchema, 
  insertEnrollmentSchema, 
  insertPaymentSchema,
  updateGradeSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Middleware to check if user is authenticated
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Unauthorized");
    }
    next();
  };

  // Course routes
  app.get("/api/courses", requireAuth, async (req, res) => {
    const courses = await storage.getAllCourses();
    res.json(courses);
  });

  app.get("/api/courses/instructor", requireAuth, async (req, res) => {
    if (req.user?.role !== "faculty") {
      return res.status(403).send("Forbidden");
    }
    const courses = await storage.getCoursesByInstructor(req.user.id);
    res.json(courses);
  });

  app.post("/api/courses", requireAuth, async (req, res) => {
    if (req.user?.role !== "faculty" && req.user?.role !== "admin") {
      return res.status(403).send("Forbidden");
    }
    const course = await storage.createCourse({
      ...req.body,
      instructorId: req.user.id,
    });
    res.status(201).json(course);
  });

  // Enrollment routes
  app.get("/api/enrollments", requireAuth, async (req, res) => {
    const enrollments = await storage.getEnrollmentsByUser(req.user!.id);
    res.json(enrollments);
  });

  app.get("/api/courses/:courseId/enrollments", requireAuth, async (req, res) => {
    if (req.user?.role !== "faculty") {
      return res.status(403).send("Forbidden");
    }
    const enrollments = await storage.getEnrollmentsByCourse(parseInt(req.params.courseId));
    res.json(enrollments);
  });

  app.post("/api/enrollments", requireAuth, async (req, res) => {
    if (req.user?.role !== "student") {
      return res.status(403).send("Forbidden");
    }
    const enrollment = await storage.createEnrollment({
      ...req.body,
      studentId: req.user.id,
    });
    res.status(201).json(enrollment);
  });

  // Grade management routes
  app.patch("/api/enrollments/:enrollmentId", requireAuth, async (req, res) => {
    if (req.user?.role !== "faculty") {
      return res.status(403).send("Forbidden");
    }

    try {
      const update = updateGradeSchema.parse(req.body);
      const enrollment = await storage.updateEnrollment(
        parseInt(req.params.enrollmentId),
        update
      );

      if (!enrollment) {
        return res.status(404).send("Enrollment not found");
      }

      res.json(enrollment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.errors);
      }
      throw error;
    }
  });

  // Payment routes
  app.get("/api/payments", requireAuth, async (req, res) => {
    const payments = await storage.getPaymentsByUser(req.user!.id);
    res.json(payments);
  });

  app.post("/api/payments", requireAuth, async (req, res) => {
    if (req.user?.role !== "student") {
      return res.status(403).send("Forbidden");
    }
    const payment = await storage.createPayment({
      ...req.body,
      studentId: req.user.id,
    });
    res.status(201).json(payment);
  });

  const httpServer = createServer(app);
  return httpServer;
}