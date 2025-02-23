import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function Dashboard() {
  const { user } = useAuth();

  const mockAttendanceData = [
    { course: "CS101", attendance: 85 },
    { course: "MATH201", attendance: 92 },
    { course: "PHY301", attendance: 78 },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Name:</strong> {user?.fullName}</p>
              <p><strong>Role:</strong> {user?.role}</p>
              <p><strong>Email:</strong> {user?.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attendance" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user?.role === "student" && (
                <>
                  <Button className="w-full">View Courses</Button>
                  <Button className="w-full" variant="outline">View Grades</Button>
                  <Button className="w-full" variant="outline">Make Payment</Button>
                </>
              )}
              {user?.role === "faculty" && (
                <>
                  <Button className="w-full">Manage Courses</Button>
                  <Button className="w-full" variant="outline">Grade Students</Button>
                  <Button className="w-full" variant="outline">Track Attendance</Button>
                </>
              )}
              {user?.role === "admin" && (
                <>
                  <Button className="w-full">Manage Users</Button>
                  <Button className="w-full" variant="outline">System Settings</Button>
                  <Button className="w-full" variant="outline">View Reports</Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}