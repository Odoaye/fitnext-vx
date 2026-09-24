"use client";

import { useState, useEffect } from 'react';
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/screens/not-found";
import { LoadingScreen } from "@/components/LoadingScreen";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "@/screens/Login";

import AdminDashboard from "@/screens/admin/Dashboard";
import AdminUsers from "@/screens/admin/Users";
import AdminDepartments from "@/screens/admin/Departments";
import AdminFaculties from "@/screens/admin/Faculties";
import AdminCourses from "@/screens/admin/Courses";
import AdminAssignments from "@/screens/admin/Assignments";
import AdminActivity from "@/screens/admin/Activity";

import StudentDashboard from "@/screens/student/Dashboard";
import StudentProfile from "@/screens/student/Profile";
import StudentLibrary from "@/screens/student/Library";
import StudentAssignments from "@/screens/student/Assignments";

import LecturerDashboard from "@/screens/lecturer/Dashboard";
import LecturerProfile from "@/screens/lecturer/Profile";
import LecturerAssignments from "@/screens/lecturer/Assignments";
import LecturerSubmissions from "@/screens/lecturer/Submissions";

import Notifications from "@/screens/Notifications";

const queryClient = new QueryClient();

function Router() {
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    if (location === '/') {
      setLocation('/login');
    }
  }, [location, setLocation]);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/admin/*">
        <AppLayout>
          <Switch>
            <Route path="/admin/dashboard" component={AdminDashboard} />
            <Route path="/admin/users" component={AdminUsers} />
            <Route path="/admin/departments" component={AdminDepartments} />
            <Route path="/admin/faculties" component={AdminFaculties} />
            <Route path="/admin/courses" component={AdminCourses} />
            <Route path="/admin/assignments" component={AdminAssignments} />
            <Route path="/admin/activity" component={AdminActivity} />
            <Route component={NotFound} />
          </Switch>
        </AppLayout>
      </Route>

      <Route path="/student/*">
        <AppLayout>
          <Switch>
            <Route path="/student/dashboard" component={StudentDashboard} />
            <Route path="/student/profile" component={StudentProfile} />
            <Route path="/student/library" component={StudentLibrary} />
            <Route path="/student/assignments" component={StudentAssignments} />
            <Route path="/student/notifications" component={Notifications} />
            <Route component={NotFound} />
          </Switch>
        </AppLayout>
      </Route>

      <Route path="/lecturer/*">
        <AppLayout>
          <Switch>
            <Route path="/lecturer/dashboard" component={LecturerDashboard} />
            <Route path="/lecturer/profile" component={LecturerProfile} />
            <Route path="/lecturer/assignments" component={LecturerAssignments} />
            <Route path="/lecturer/submissions" component={LecturerSubmissions} />
            <Route path="/lecturer/notifications" component={Notifications} />
            <Route component={NotFound} />
          </Switch>
        </AppLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={(process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
