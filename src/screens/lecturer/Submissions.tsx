import { useState, useEffect } from 'react';
import { getDb, saveDb } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function LecturerSubmissions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  const loadData = () => {
    if (user) {
      const db = getDb();
      const myAssignments = db.assignments.filter((a: any) => a.lecturer_id === user.id);
      const myAssignmentIds = myAssignments.map((a: any) => a.id);
      const subs = db.submissions.filter((s: any) => myAssignmentIds.includes(s.assignment_id));
      
      setAssignments(myAssignments);
      setSubmissions(subs);
      setStudents(db.users.filter((u: any) => u.role === 'student'));
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleGrade = (id: string) => {
    if (!grade) {
      toast({ title: "Error", description: "Grade is required", variant: "destructive" });
      return;
    }
    const db = getDb();
    const sub = db.submissions.find((s: any) => s.id === id);
    if (sub) {
      sub.status = 'graded';
      sub.grade = grade;
      sub.feedback = feedback;
      saveDb(db);
      loadData();
      setSelectedSub(null);
      setGrade('');
      setFeedback('');
      toast({ title: "Graded", description: "Submission graded successfully." });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Submissions</h1>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Assignment</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((sub) => {
              const assignment = assignments.find(a => a.id === sub.assignment_id);
              const student = students.find(s => s.id === sub.student_id);
              
              return (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{student?.name || 'Unknown'}</TableCell>
                  <TableCell>{assignment?.title || 'Unknown'}</TableCell>
                  <TableCell>{sub.submitted_at ? format(new Date(sub.submitted_at), 'PPp') : 'N/A'}</TableCell>
                  <TableCell>
                    {sub.status === 'graded' ? (
                      <Badge className="bg-green-600">Graded: {sub.grade}</Badge>
                    ) : (
                      <Badge className="bg-blue-600">Submitted</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog open={selectedSub === sub.id} onOpenChange={(open) => {
                      if(open) {
                        setSelectedSub(sub.id);
                        setGrade(sub.grade || '');
                        setFeedback(sub.feedback || '');
                      } else {
                        setSelectedSub(null);
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          {sub.status === 'graded' ? 'Edit Grade' : 'Grade'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Grade Submission</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Grade</Label>
                            <Input value={grade} onChange={e => setGrade(e.target.value)} placeholder="e.g. 95 or A" />
                          </div>
                          <div className="space-y-2">
                            <Label>Feedback</Label>
                            <Textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Optional feedback..." />
                          </div>
                          <Button className="w-full" onClick={() => handleGrade(sub.id)}>Save Grade</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              );
            })}
            {submissions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No submissions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}