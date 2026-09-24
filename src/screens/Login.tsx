import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const ROLE_REDIRECTS: Record<string, string> = {
  admin: '/admin/dashboard',
  student: '/student/library',
  lecturer: '/lecturer/assignments',
};

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [role, setRole] = useState<'admin' | 'student' | 'lecturer'>('student');

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    const db = getDb();
    const user = db.users.find((u: any) => u.username === values.username && u.role === role);
    const validPassword = values.password === (user?.role === 'admin' ? 'admin123' : 'pass123');

    if (user && validPassword) {
      login(user);
      setLocation(ROLE_REDIRECTS[role]);
    } else {
      toast({ title: 'Login Failed', description: 'Invalid username or password.', variant: 'destructive' });
    }
  };

  const fillDemo = (r: 'admin' | 'student' | 'lecturer') => {
    setRole(r);
    const map = { admin: 'admin', student: 'student1', lecturer: 'lect1' };
    form.setValue('username', map[r]);
    form.setValue('password', r === 'admin' ? 'admin123' : 'pass123');
  };

  const roles: Array<{ id: 'admin' | 'student' | 'lecturer'; label: string }> = [
    { id: 'student', label: 'Student' },
    { id: 'lecturer', label: 'Lecturer' },
    { id: 'admin', label: 'Admin' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary">XcelLearn</h1>
          <p className="text-sm text-muted-foreground mt-1.5">by XEStudioz</p>
        </div>

        <Card className="border-border shadow-md">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription className="text-sm">Select your role to sign in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex gap-1.5 p-1 bg-muted rounded-lg">
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => fillDemo(r.id)}
                  className={cn(
                    'flex-1 py-1.5 rounded-md text-sm font-medium transition-all',
                    role === r.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                  data-testid={`tab-role-${r.id}`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="username" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} data-testid="input-username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter password" {...field} data-testid="input-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" data-testid="button-submit">
                  Sign In
                </Button>
              </form>
            </Form>

            <div className="pt-1 text-center border-t border-border">
              <p className="text-xs font-medium text-foreground mb-2 mt-3">Demo Credentials</p>
              <div className="space-y-1.5">
                {[
                  { role: 'admin' as const, label: 'Admin: admin / admin123' },
                  { role: 'student' as const, label: 'Student: student1 / pass123' },
                  { role: 'lecturer' as const, label: 'Lecturer: lect1 / pass123' },
                ].map(item => (
                  <button
                    key={item.role}
                    onClick={() => fillDemo(item.role)}
                    className="block w-full text-left text-xs text-muted-foreground hover:text-primary underline decoration-dotted underline-offset-2 transition-colors"
                    data-testid={`demo-cred-${item.role}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
