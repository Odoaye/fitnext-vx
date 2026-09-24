import { useState, useEffect } from 'react';
import { getDb } from '@/lib/db';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const db = getDb();
    setAssignments(db.assignments);
    setCourses(db.courses);
    setUsers(db.users);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Lecturer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Deadline</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => {
              const course = courses.find(c => c.id === assignment.course_id);
              const lect = users.find(u => u.id === assignment.lecturer_id);
              return (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.title}</TableCell>
                  <TableCell>{course?.name || 'Unknown'}</TableCell>
                  <TableCell>{lect?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{assignment.type}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(assignment.deadline), 'PPp')}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}