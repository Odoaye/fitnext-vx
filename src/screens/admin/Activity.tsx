import { useState, useEffect } from 'react';
import { getDb } from '@/lib/db';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export default function AdminActivity() {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    // Generate mock activity from DB data just to show something
    const db = getDb();
    const mockActivity = [
      ...db.submissions.map((s: any) => ({ id: `act_s_${s.id}`, type: 'submission', message: `Submission ${s.status}`, date: s.submitted_at || new Date().toISOString() })),
      ...db.assignments.map((a: any) => ({ id: `act_a_${a.id}`, type: 'assignment', message: `Created ${a.title}`, date: a.created_at || new Date().toISOString() })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setActivities(mockActivity);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((act) => (
              <TableRow key={act.id}>
                <TableCell className="font-medium">{act.message}</TableCell>
                <TableCell className="capitalize">{act.type}</TableCell>
                <TableCell>{format(new Date(act.date), 'PPp')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}