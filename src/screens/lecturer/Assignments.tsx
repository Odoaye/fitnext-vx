import { useState, useEffect } from 'react';
import { getDb, saveDb } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CommentsThread } from '@/components/CommentsThread';

const assignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  course_id: z.string().min(1, 'Course is required'),
  type: z.enum(['assignment', 'quiz']),
  deadline: z.string().min(1, 'Deadline is required'),
  allow_retake: z.boolean().default(false)
});

export default function LecturerAssignments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof assignmentSchema>>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: { title: '', description: '', course_id: '', type: 'assignment', deadline: '', allow_retake: false },
  });

  const loadData = () => {
    if (user) {
      const db = getDb();
      setAssignments(db.assignments.filter((a: any) => a.lecturer_id === user.id));
      setSubmissions(db.submissions);
      setCourses(db.courses.filter((c: any) => c.lecturer_id === user.id));
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onSubmit = (values: z.infer<typeof assignmentSchema>) => {
    const db = getDb();
    const newAssignment = {
      id: `a${Date.now()}`,
      title: values.title,
      description: values.description,
      course_id: values.course_id,
      lecturer_id: user?.id,
      deadline: new Date(values.deadline).toISOString(),
      type: values.type,
      allow_retake: values.allow_retake,
      created_at: new Date().toISOString()
    };
    db.assignments.push(newAssignment);
    saveDb(db);
    loadData();
    setIsOpen(false);
    form.reset();
    toast({
      title: "Assignment Created",
      description: "The assignment has been successfully added."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Assignments & Quizzes</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Create Assignment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="Assignment Title" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="Description..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="course_id" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courses.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.code}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="assignment">Assignment</SelectItem>
                          <SelectItem value="quiz">Quiz</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="deadline" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <FormControl><Input type="datetime-local" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="allow_retake" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Allow Retake</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
                <Button type="submit" className="w-full">Create</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assignments.length > 0 ? (
          assignments.map(assignment => {
            const course = courses.find(c => c.id === assignment.course_id);
            const subsCount = submissions.filter(s => s.assignment_id === assignment.id).length;

            return (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl line-clamp-1" title={assignment.title}>{assignment.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{course?.code}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">{assignment.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Due: {format(new Date(assignment.deadline), 'PPp')}
                  </div>
                  <div className="text-sm mb-4">
                    <strong>{subsCount}</strong> Submissions
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary" size="sm" className="w-full">View Details</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{assignment.title}</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>
                        <CommentsThread assignmentId={assignment.id} />
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No assignments created.
          </div>
        )}
      </div>
    </div>
  );
}