import { useState, useEffect } from 'react';
import { getDb, saveDb } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';

export function CommentsThread({ assignmentId }: { assignmentId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  const loadData = () => {
    const db = getDb();
    setComments(db.comments.filter((c: any) => c.assignment_id === assignmentId).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
    setUsers(db.users);
  };

  useEffect(() => {
    loadData();
  }, [assignmentId]);

  const handleSubmit = () => {
    if (!newComment.trim() || !user) return;
    
    const db = getDb();
    const comment = {
      id: `c${Date.now()}`,
      assignment_id: assignmentId,
      user_id: user.id,
      content: newComment.trim(),
      created_at: new Date().toISOString()
    };
    db.comments.push(comment);

    // Create notification for the other party
    const assignment = db.assignments.find((a: any) => a.id === assignmentId);
    if (assignment) {
      const notifyUserId = user.role === 'student' ? assignment.lecturer_id : db.submissions.find((s: any) => s.assignment_id === assignmentId)?.student_id;
      if (notifyUserId) {
        db.notifications.push({
          id: `n${Date.now()}`,
          user_id: notifyUserId,
          type: 'comment',
          message: `New comment on ${assignment.title} from ${user.name}`,
          read: false,
          created_at: new Date().toISOString(),
          link: `/${user.role === 'student' ? 'lecturer' : 'student'}/assignments`
        });
      }
    }

    saveDb(db);
    setNewComment('');
    loadData();
  };

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-lg font-semibold">Comments</h3>
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {comments.map(comment => {
          const author = users.find(u => u.id === comment.user_id);
          return (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{author?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{author?.name}</span>
                  <span className="text-xs text-muted-foreground">{format(new Date(comment.created_at), 'PPp')}</span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          );
        })}
        {comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
      </div>
      <div className="flex gap-2 pt-2 border-t">
        <Textarea 
          placeholder="Add a comment..." 
          value={newComment} 
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[60px]"
        />
        <Button onClick={handleSubmit} className="self-end">Post</Button>
      </div>
    </div>
  );
}
