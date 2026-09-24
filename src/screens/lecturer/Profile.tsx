import { useState, useEffect } from 'react';
import { getDb } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BookOpen, Building2, LogOut, FileText, Users, ClipboardCheck, BookMarked, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';

export default function LecturerProfile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [courses, setCourses] = useState<any[]>([]);
  const [department, setDepartment] = useState<any>(null);
  const [faculty, setFaculty] = useState<any>(null);
  const [stats, setStats] = useState({
    coursesCount: 0,
    assignmentsCount: 0,
    pendingSubmissions: 0,
    recentSubmissions: [] as any[],
  });

  useEffect(() => {
    if (user) {
      const db = getDb();
      const myCourses = db.courses.filter((c: any) => c.lecturer_id === user.id);
      setCourses(myCourses);
      setDepartment(db.departments.find((d: any) => d.id === user.department_id));
      setFaculty(db.faculties.find((f: any) => f.id === user.faculty_id));

      const myAssignments = db.assignments.filter((a: any) => a.lecturer_id === user.id);
      const myIds = myAssignments.map((a: any) => a.id);
      const submissions = db.submissions.filter((s: any) => myIds.includes(s.assignment_id));
      const pending = submissions.filter((s: any) => s.status === 'submitted');
      const allStudents = db.users.filter((u: any) => u.role === 'student');

      setStats({
        coursesCount: myCourses.length,
        assignmentsCount: myAssignments.length,
        pendingSubmissions: pending.length,
        recentSubmissions: pending.slice(0, 4).map((s: any) => ({
          ...s,
          assignment: myAssignments.find((a: any) => a.id === s.assignment_id),
          student: allStudents.find((u: any) => u.id === s.student_id),
        })),
      });
    }
  }, [user]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const initials = user.name.split(' ').map((n: string) => n[0]).join('');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <Button size="sm" variant="ghost" onClick={handleLogout} className="text-muted-foreground" data-testid="button-logout">
          <LogOut size={15} className="mr-1.5" /> Logout
        </Button>
      </div>

      <Card>
        <CardContent className="pt-5 px-4 pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-border">
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
              <Badge variant="secondary" className="mt-1 text-xs capitalize">{user.role}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
              <Building2 size={15} className="text-primary shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Department</p>
                <p className="text-xs font-medium">{department?.name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
              <BookMarked size={15} className="text-primary shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Faculty</p>
                <p className="text-xs font-medium">{faculty?.name || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1"><BookOpen size={12} /> Courses Taught</p>
            <div className="flex flex-wrap gap-1.5">
              {courses.length > 0 ? courses.map(c => (
                <Badge key={c.id} variant="outline" className="text-xs px-2 py-0.5">{c.code}: {c.name}</Badge>
              )) : <p className="text-xs text-muted-foreground">No courses assigned.</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Activity size={16} className="text-muted-foreground" /> Dashboard Overview
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardContent className="pt-4 pb-3 px-3">
              <Users size={16} className="text-muted-foreground mb-2" />
              <div className="text-2xl font-bold">{stats.coursesCount}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Courses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-3">
              <FileText size={16} className="text-muted-foreground mb-2" />
              <div className="text-2xl font-bold">{stats.assignmentsCount}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Posted</p>
            </CardContent>
          </Card>
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-4 pb-3 px-3">
              <ClipboardCheck size={16} className="text-primary-foreground/80 mb-2" />
              <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
              <p className="text-[10px] text-primary-foreground/80 mt-0.5">Pending</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {stats.recentSubmissions.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-1.5"><ClipboardCheck size={14} className="text-muted-foreground" /> Pending Submissions</span>
              <Link href="/lecturer/submissions" className="text-xs text-primary font-normal hover:underline">View all</Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2">
              {stats.recentSubmissions.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/30">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{s.student?.name || 'Student'}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.assignment?.title}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0 ml-2">To Grade</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
