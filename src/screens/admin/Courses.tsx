import { useState, useEffect } from 'react';
import { getDb } from '@/lib/db';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const db = getDb();
    setCourses(db.courses);
    setDepartments(db.departments);
    setUsers(db.users);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Lecturer</TableHead>
              <TableHead>Students</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => {
              const dept = departments.find(d => d.id === course.department_id);
              const lect = users.find(u => u.id === course.lecturer_id);
              const studentCount = users.filter(u => u.role === 'student' && u.courses?.includes(course.id)).length;
              return (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.code}</TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{dept?.name || 'Unknown'}</TableCell>
                  <TableCell>{lect?.name || 'Unknown'}</TableCell>
                  <TableCell>{studentCount}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}