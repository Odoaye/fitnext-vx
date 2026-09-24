import { useState, useEffect } from 'react';
import { getDb } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BookOpen, Building2, GraduationCap, LogOut, FileText, CheckCircle2, Clock, BookMarked } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLocation } from 'wouter';

export default function StudentProfile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [courses, setCourses] = useState<any[]>([]);
  const [department, setDepartment] = useState<any>(null);
  const [faculty, setFaculty] = useState<any>(null);
  const [stats, setStats] = useState({
    assignmentsDone: 0,
    assignmentsTotal: 0,
    quizzesDone: 0,
    quizzesTotal: 0,
    upcomingDeadlines: [] as any[],
  });

  useEffect(() => {
    if (user) {
      const db = getDb();
      setCourses(db.courses.filter((c: any) => user.courses?.includes(c.id)));
      setDepartment(db.departments.find((d: any) => d.id === user.department_id));
      setFaculty(db.faculties.find((f: any) => f.id === user.faculty_id));

      const assignments = db.assignments.filter((a: any) => user.courses?.includes(a.course_id));
      const submissions = db.submissions.filter((s: any) => s.student_id === user.id);
      const quizAttempts = (db.quiz_attempts || []).filter((qa: any) => qa.student_id === user.id);

      const asgmts = assignments.filter((a: any) => a.type === 'assignment');
      const quizzes = assignments.filter((a: any) => a.type === 'quiz');
      const upcoming = assignments
        .filter((a: any) => new Date(a.deadline) > new Date() && !submissions.some((s: any) => s.assignment_id === a.id))
        .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 4);

      setStats({
        assignmentsDone: submissions.filter((s: any) => asgmts.some((a: any) => a.id === s.assignment_id)).length,
        assignmentsTotal: asgmts.length,
        quizzesDone: quizAttempts.length,
        quizzesTotal: quizzes.length,
        upcomingDeadlines: upcoming,
      });
    }
  }, [user]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const initials = user.name.split(' ').map((n: string) => n[0]).join('');
  const assignmentPct = stats.assignmentsTotal > 0 ? Math.round((stats.assignmentsDone / stats.assignmentsTotal) * 100) : 0;
  const quizPct = stats.quizzesTotal > 0 ? Math.round((stats.quizzesDone / stats.quizzesTotal) * 100) : 0;

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

          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="flex flex-col items-center gap-0.5 p-2.5 rounded-lg bg-muted/50 border text-center">
              <Building2 size={15} className="text-primary" />
              <span className="text-[10px] text-muted-foreground leading-none mt-1">Department</span>
              <span className="text-xs font-medium leading-snug mt-0.5">{department?.name || 'N/A'}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 p-2.5 rounded-lg bg-muted/50 border text-center">
              <BookMarked size={15} className="text-primary" />
              <span className="text-[10px] text-muted-foreground leading-none mt-1">Faculty</span>
              <span className="text-xs font-medium leading-snug mt-0.5">{faculty?.name || 'N/A'}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 p-2.5 rounded-lg bg-muted/50 border text-center">
              <GraduationCap size={15} className="text-primary" />
              <span className="text-[10px] text-muted-foreground leading-none mt-1">Year</span>
              <span className="text-xs font-medium leading-snug mt-0.5">Year {user.year || 'N/A'}</span>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1"><BookOpen size={12} /> Enrolled Courses</p>
            <div className="flex flex-wrap gap-1.5">
              {courses.length > 0 ? courses.map(c => (
                <Badge key={c.id} variant="outline" className="text-xs px-2 py-0.5">{c.code}: {c.name}</Badge>
              )) : <p className="text-xs text-muted-foreground">No courses enrolled.</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <FileText size={16} className="text-muted-foreground" /> Progress Overview
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">Assignments</span>
                <FileText size={14} className="text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{stats.assignmentsDone}<span className="text-sm font-normal text-muted-foreground">/{stats.assignmentsTotal}</span></div>
              <Progress value={assignmentPct} className="h-1.5 mt-2" />
              <p className="text-[10px] text-muted-foreground mt-1">{assignmentPct}% complete</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">Quizzes</span>
                <CheckCircle2 size={14} className="text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{stats.quizzesDone}<span className="text-sm font-normal text-muted-foreground">/{stats.quizzesTotal}</span></div>
              <Progress value={quizPct} className="h-1.5 mt-2" />
              <p className="text-[10px] text-muted-foreground mt-1">{quizPct}% complete</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {stats.upcomingDeadlines.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Clock size={14} className="text-muted-foreground" /> Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2">
              {stats.upcomingDeadlines.map((a: any) => {
                const daysLeft = Math.ceil((new Date(a.deadline).getTime() - Date.now()) / 86400000);
                return (
                  <div key={a.id} className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/30">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{a.type}</p>
                    </div>
                    <Badge variant={daysLeft <= 1 ? 'destructive' : 'secondary'} className="text-xs shrink-0 ml-2">
                      {daysLeft === 0 ? 'Today' : daysLeft === 1 ? '1 day' : `${daysLeft} days`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
