import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  GraduationCap,
  HomeIcon,
  LogOut,
  Users,
  CreditCard,
} from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: HomeIcon,
      show: true,
    },
    {
      name: "Courses",
      href: "/faculty/courses",
      icon: BookOpen,
      show: user?.role === "faculty" || user?.role === "admin",
    },
    {
      name: "Students",
      href: "/admin/students",
      icon: Users,
      show: user?.role === "admin",
    },
    {
      name: "My Courses",
      href: "/student/courses",
      icon: GraduationCap,
      show: user?.role === "student",
    },
    {
      name: "Payments",
      href: "/student/payments",
      icon: CreditCard,
      show: user?.role === "student",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">University Management System</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.fullName}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 border-r min-h-[calc(100vh-73px)] p-4">
          <nav className="space-y-2">
            {navigation
              .filter((item) => item.show)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                        location === item.href
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </a>
                  </Link>
                );
              })}
          </nav>
        </aside>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
