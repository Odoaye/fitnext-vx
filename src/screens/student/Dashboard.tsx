import { useState, useEffect } from 'react';
import { getDb } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'wouter';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ 
    assignmentsDone: 0, 
    assignmentsTotal: 0,
    quizzesDone: 0,
    quizzesTotal: 0,
    upcomingDeadlines: [] as any[]
  });

  useEffect(() => {
    if (user) {
      const db = getDb();
      const assignments = db.assignments.filter((a: any) => user.courses?.includes(a.course_id));
      const submissions = db.submissions.filter((s: any) => s.student_id === user.id);
      
      const asgmts = assignments.filter((a: any) => a.type === 'assignment');
      const quizzes = assignments.filter((a: any) => a.type === 'quiz');

      const upcoming = assignments
        .filter((a: any) => new Date(a.deadline) > new Date() && !submissions.some((s: any) => s.assignment_id === a.id))
        .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 3);

      setStats({
        assignmentsDone: submissions.filter((s: any) => asgmts.some((a: any) => a.id === s.assignment_id)).length,
        assignmentsTotal: asgmts.length,
        quizzesDone: submissions.filter((s: any) => quizzes.some((q: any) => q.id === s.assignment_id)).length,
        quizzesTotal: quizzes.length,
        upcomingDeadlines: upcoming
      });
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name.split(' ')[0]}</h1>
        <p className="text-muted-foreground mt-1">Here is your progress overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.courses?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assignments Progress</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assignmentsDone} / {stats.assignmentsTotal}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.quizzesDone} / {stats.quizzesTotal}</div>
          </CardContent>
        </Card>
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/90">Upcoming Deadlines</CardTitle>
            <Clock className="h-4 w-4 text-primary-foreground/90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingDeadlines.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Approaching Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.upcomingDeadlines.length > 0 ? (
              <div className="space-y-4">
                {stats.upcomingDeadlines.map(a => (
                  <div key={a.id} className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">Due: {new Date(a.deadline).toLocaleDateString()}</p>
                    </div>
                    <Link href="/student/assignments" className="text-sm font-medium text-primary hover:underline">
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No upcoming deadlines.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}