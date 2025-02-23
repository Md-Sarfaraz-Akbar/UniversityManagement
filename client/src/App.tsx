import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import FacultyCourses from "@/pages/faculty-courses";
import StudentCourses from "@/pages/student-courses";
import StudentPayments from "@/pages/student-payments";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute
        path="/"
        component={() => (
          <Layout>
            <Dashboard />
          </Layout>
        )}
      />
      <ProtectedRoute
        path="/faculty/courses"
        component={() => (
          <Layout>
            <FacultyCourses />
          </Layout>
        )}
      />
      <ProtectedRoute
        path="/student/courses"
        component={() => (
          <Layout>
            <StudentCourses />
          </Layout>
        )}
      />
      <ProtectedRoute
        path="/student/payments"
        component={() => (
          <Layout>
            <StudentPayments />
          </Layout>
        )}
      />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;