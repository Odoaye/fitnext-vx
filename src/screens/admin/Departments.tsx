import { useState, useEffect } from 'react';
import { getDb, saveDb } from '@/lib/db';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const deptSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  faculty_id: z.string().min(1, 'Faculty is required'),
});

export default function AdminDepartments() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof deptSchema>>({
    resolver: zodResolver(deptSchema),
    defaultValues: { name: '', faculty_id: '' },
  });

  const loadData = () => {
    const db = getDb();
    setDepartments(db.departments);
    setFaculties(db.faculties);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = (values: z.infer<typeof deptSchema>) => {
    const db = getDb();
    const newDept = {
      id: `d${Date.now()}`,
      name: values.name,
      faculty_id: values.faculty_id,
    };
    db.departments.push(newDept);
    saveDb(db);
    loadData();
    setIsOpen(false);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Department</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input placeholder="Department Name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="faculty_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faculty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a faculty" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {faculties.map(f => (
                          <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full">Save</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Faculty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((dept) => {
              const faculty = faculties.find(f => f.id === dept.faculty_id);
              return (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>{faculty?.name || 'Unknown'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}