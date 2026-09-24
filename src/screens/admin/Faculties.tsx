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

const facultySchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export default function AdminFaculties() {
  const [faculties, setFaculties] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof facultySchema>>({
    resolver: zodResolver(facultySchema),
    defaultValues: { name: '' },
  });

  const loadData = () => {
    const db = getDb();
    setFaculties(db.faculties);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = (values: z.infer<typeof facultySchema>) => {
    const db = getDb();
    const newFaculty = {
      id: `f${Date.now()}`,
      name: values.name,
    };
    db.faculties.push(newFaculty);
    saveDb(db);
    loadData();
    setIsOpen(false);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Faculties</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Faculty</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Faculty</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input placeholder="Faculty Name" {...field} /></FormControl>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {faculties.map((fac) => (
              <TableRow key={fac.id}>
                <TableCell className="font-medium">{fac.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}