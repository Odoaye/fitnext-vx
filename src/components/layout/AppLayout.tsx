import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Building2,
  BookOpen,
  FileText,
  Activity,
  Bell,
  LogOut,
  Menu,
  X,
  ClipboardList,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getDb } from '@/lib/db';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    setLocation('/login');
    return null;
  }

  const db = getDb();
  const unreadCount = db.notifications.filter((n: any) => n.user_id === user.id && !n.read).length;

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  if (user.role === 'admin') {
    const adminLinks = [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/departments', label: 'Departments', icon: Building2 },
      { href: '/admin/faculties', label: 'Faculties', icon: Building2 },
      { href: '/admin/courses', label: 'Courses', icon: BookOpen },
      { href: '/admin/assignments', label: 'Assignments', icon: FileText },
      { href: '/admin/activity', label: 'Activity', icon: Activity },
    ];

    return (
      <div className="flex min-h-screen bg-background">
        <button
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-md shadow-sm border border-border"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          data-testid="button-mobile-menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <aside className={cn(
          "fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 ease-in-out border-r border-sidebar-border",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <div className="p-6 border-b border-sidebar-border">
            <h1 className="text-xl font-bold tracking-tight">XcelLearn</h1>
            <p className="text-xs text-sidebar-foreground/60 mt-0.5">by XEStudioz</p>
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {adminLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                      location === link.href
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground"
                    )}>
                      <link.icon size={18} />
                      {link.label}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-9 w-9 border border-sidebar-border">
                <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/60 capitalize">{user.role}</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" /> Logout
            </Button>
          </div>
        </aside>

        <main className="flex-1 w-full overflow-x-hidden">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
        </main>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}
      </div>
    );
  }

  const studentTabs = [
    { href: '/student/library', label: 'Library', icon: BookOpen },
    { href: '/student/assignments', label: 'Assignments', icon: FileText },
    { href: '/student/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { href: '/student/profile', label: 'Profile', icon: User },
  ];

  const lecturerTabs = [
    { href: '/lecturer/assignments', label: 'Assignments', icon: FileText },
    { href: '/lecturer/submissions', label: 'Submissions', icon: ClipboardList },
    { href: '/lecturer/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { href: '/lecturer/profile', label: 'Profile', icon: User },
  ];

  const tabs = user.role === 'student' ? studentTabs : lecturerTabs;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-background/95 backdrop-blur border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-base tracking-tight">XcelLearn</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">by XEStudioz</span>
        </div>
        <Link href={`/${user.role}/notifications`} className="relative p-2 rounded-md hover:bg-muted transition-colors" data-testid="link-notifications-bell">
          <Bell size={20} className="text-foreground/70" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
      </header>

      <main className="flex-1 pt-14 pb-20">
        <div className="p-4 max-w-3xl mx-auto">
          {children}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-background/95 backdrop-blur border-t border-border" data-testid="nav-bottom">
        <div className="flex h-full max-w-lg mx-auto">
          {tabs.map((tab) => {
            const isActive = location === tab.href || location.startsWith(tab.href + '/');
            return (
              <Link key={tab.href} href={tab.href} className="flex-1 flex flex-col items-center justify-center gap-0.5 relative" data-testid={`nav-tab-${tab.label.toLowerCase()}`}>
                <div className="relative">
                  <tab.icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={cn(
                      "transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  {(tab as any).badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                      {(tab as any).badge > 9 ? '9+' : (tab as any).badge}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium leading-none",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
