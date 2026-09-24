import AppShell from "../AppShell";

const appRoutes = [
  "login",
  "admin/dashboard",
  "admin/users",
  "admin/departments",
  "admin/faculties",
  "admin/courses",
  "admin/assignments",
  "admin/activity",
  "student/dashboard",
  "student/profile",
  "student/library",
  "student/assignments",
  "student/notifications",
  "lecturer/dashboard",
  "lecturer/profile",
  "lecturer/assignments",
  "lecturer/submissions",
  "lecturer/notifications",
];

export const dynamicParams = false;

export function generateStaticParams() {
  return appRoutes.map((route) => ({
    segments: route.split("/"),
  }));
}

export default function AppRoutePage() {
  return <AppShell />;
}