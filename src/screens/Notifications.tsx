import { useState, useEffect } from 'react';
import { getDb, saveDb } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Check, Clock, MessageSquare, Award } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  const loadData = () => {
    if (user) {
      const db = getDb();
      setNotifications(db.notifications.filter((n: any) => n.user_id === user.id).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const markAsRead = (id: string) => {
    const db = getDb();
    const notification = db.notifications.find((n: any) => n.id === id);
    if (notification) {
      notification.read = true;
      saveDb(db);
      loadData();
    }
  };

  const markAllAsRead = () => {
    const db = getDb();
    db.notifications.forEach((n: any) => {
      if (n.user_id === user?.id) {
        n.read = true;
      }
    });
    saveDb(db);
    loadData();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'comment': return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'deadline': return <Clock className="h-5 w-5 text-orange-500" />;
      case 'grade': return <Award className="h-5 w-5 text-green-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        {notifications.some(n => !n.read) && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <Check className="mr-2 h-4 w-4" /> Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <Card key={notif.id} className={`transition-colors ${!notif.read ? 'bg-primary/5 border-primary/20' : ''}`}>
              <CardContent className="p-4 flex gap-4">
                <div className="mt-1">{getIcon(notif.type)}</div>
                <div className="flex-1">
                  <p className={`text-sm ${!notif.read ? 'font-semibold' : ''}`}>{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(notif.created_at), 'PPp')}
                  </p>
                </div>
                {!notif.read && (
                  <Button variant="ghost" size="sm" onClick={() => markAsRead(notif.id)}>
                    Mark Read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            No notifications. You're all caught up!
          </div>
        )}
      </div>
    </div>
  );
}