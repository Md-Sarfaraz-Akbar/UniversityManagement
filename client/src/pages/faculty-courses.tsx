import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Course, InsertCourse, insertCourseSchema, Enrollment, updateGradeSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { PlusCircle, BookOpen, GraduationCap } from "lucide-react";

export default function FacultyCourses() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses/instructor"],
  });

  const form = useForm<InsertCourse>({
    resolver: zodResolver(insertCourseSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      credits: 3,
      instructorId: user?.id,
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: InsertCourse) => {
      const res = await apiRequest("POST", "/api/courses", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses/instructor"] });
      toast({
        title: "Success",
        description: "Course created successfully",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateGradeMutation = useMutation({
    mutationFn: async ({ 
      enrollmentId, 
      data 
    }: { 
      enrollmentId: number; 
      data: { grade: string; attendance: number; }
    }) => {
      const res = await apiRequest("PATCH", `/api/enrollments/${enrollmentId}`, data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/courses", variables.enrollmentId, "enrollments"] 
      });
      toast({
        title: "Success",
        description: "Grade updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get enrollments for a specific course
  const useEnrollments = (courseId: number) => {
    return useQuery<Enrollment[]>({
      queryKey: ["/api/courses", courseId, "enrollments"],
      queryFn: async () => {
        const res = await fetch(`/api/courses/${courseId}/enrollments`);
        if (!res.ok) throw new Error("Failed to fetch enrollments");
        return res.json();
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) =>
                  createCourseMutation.mutate(data)
                )}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. CS101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Introduction to Computer Science"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter course description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="credits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credits</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createCourseMutation.isPending}
                >
                  Create Course
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const { data: enrollments = [] } = useEnrollments(course.id);

          return (
            <Card key={course.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {course.name}
                </CardTitle>
                <CardDescription>{course.code}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground mb-4">
                  {course.description}
                </p>
                <p className="text-sm mb-4">
                  <strong>Credits:</strong> {course.credits}
                </p>
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Enrolled Students ({enrollments.length})
                  </h3>
                  {enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="bg-muted p-3 rounded-lg space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">
                          Student ID: {enrollment.studentId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Last Updated: {format(new Date(enrollment.lastUpdated), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Select
                          defaultValue={enrollment.grade}
                          onValueChange={(grade) =>
                            updateGradeMutation.mutate({
                              enrollmentId: enrollment.id,
                              data: {
                                grade,
                                attendance: enrollment.attendance
                              }
                            })
                          }
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Grade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                            <SelectItem value="D">D</SelectItem>
                            <SelectItem value="F">F</SelectItem>
                            <SelectItem value="IP">In Progress</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="Attendance %"
                          className="w-[120px]"
                          value={enrollment.attendance}
                          onChange={(e) =>
                            updateGradeMutation.mutate({
                              enrollmentId: enrollment.id,
                              data: {
                                grade: enrollment.grade,
                                attendance: parseFloat(e.target.value)
                              }
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}