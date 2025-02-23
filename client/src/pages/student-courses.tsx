import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Course, Enrollment, insertEnrollmentSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Check } from "lucide-react";

export default function StudentCourses() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: enrollments = [] } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments"],
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const res = await apiRequest("POST", "/api/enrollments", { courseId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      toast({
        title: "Success",
        description: "Successfully enrolled in the course",
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

  const enrolledCourseIds = enrollments.map((e) => e.courseId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">My Enrolled Courses</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses
            .filter((course) => enrolledCourseIds.includes(course.id))
            .map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {course.name}
                  </CardTitle>
                  <CardDescription>{course.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {course.description}
                  </p>
                  <p className="text-sm">
                    <strong>Credits:</strong> {course.credits}
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Available Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses
            .filter((course) => !enrolledCourseIds.includes(course.id))
            .map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {course.name}
                  </CardTitle>
                  <CardDescription>{course.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {course.description}
                  </p>
                  <p className="text-sm mb-4">
                    <strong>Credits:</strong> {course.credits}
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => enrollMutation.mutate(course.id)}
                    disabled={enrollMutation.isPending}
                  >
                    Enroll Now
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
