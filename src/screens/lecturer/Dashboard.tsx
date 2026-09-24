import { useState, useEffect } from 'react';
import { getDb } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, CheckSquare, Activity } from 'lucide-react';
import { Link } from 'wouter';

export default function LecturerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ 
    courses: 0,
    assignments: 0,
    pendingSubmissions: 0,
    recentActivity: [] as any[]
  });

  useEffect(() => {
    if (user) {
      const db = getDb();
      const myCourses = db.courses.filter((c: any) => c.lecturer_id === user.id);
      const myAssignments = db.assignments.filter((a: any) => a.lecturer_id === user.id);
      const myAssignmentIds = myAssignments.map((a: any) => a.id);
      const submissions = db.submissions.filter((s: any) => myAssignmentIds.includes(s.assignment_id));
      
      const pending = submissions.filter((s: any) => s.status === 'submitted');
      
      setStats({
        courses: myCourses.length,
        assignments: myAssignments.length,
        pendingSubmissions: pending.length,
        recentActivity: pending.slice(0, 3)
      });
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name.split(' ')[0]}</h1>
        <p className="text-muted-foreground mt-1">Here is your lecturer overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses Taught</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assignments Posted</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assignments}</div>
          </CardContent>
        </Card>
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/90">Pending Submissions</CardTitle>
            <CheckSquare className="h-4 w-4 text-primary-foreground/90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map(s => (
                  <div key={s.id} className="flex justify-between items-center p-3 rounded-lg border bg-muted/20">
                    <p className="text-sm font-medium">New submission to grade</p>
                    <Link href="/lecturer/submissions" className="text-sm font-medium text-primary hover:underline">
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">All caught up! No pending submissions.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}