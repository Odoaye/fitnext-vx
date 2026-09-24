import { useState, useEffect } from 'react';
import { getDb } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Video, BookOpen, Search, Download, MessageSquare, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CommentsThread } from '@/components/CommentsThread';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function StudentLibrary() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [commentItem, setCommentItem] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      const db = getDb();
      const userItems = db.library_items.filter(
        (item: any) => item.department_id === user.department_id && item.year_level === user.year
      );
      setItems(userItems);
      setCourses(db.courses.filter((c: any) => user.courses?.includes(c.id)));
      setLecturers(db.users.filter((u: any) => u.role === 'lecturer'));
    }
  }, [user]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = courseFilter === 'all' || item.course_id === courseFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesCourse && matchesType;
  });

  const handleDownload = (item: any) => {
    toast({
      title: 'Preparing Download',
      description: `"${item.title}" will download shortly. (Demo mode)`,
    });
  };

  const getIcon = (type: string) => {
    if (type === 'pdf') return <FileText className="h-5 w-5 text-blue-600" />;
    if (type === 'video') return <Video className="h-5 w-5 text-rose-500" />;
    return <BookOpen className="h-5 w-5 text-emerald-600" />;
  };

  const getTypeColor = (type: string) => {
    if (type === 'pdf') return 'bg-blue-50 border-blue-200 text-blue-700';
    if (type === 'video') return 'bg-rose-50 border-rose-200 text-rose-700';
    return 'bg-emerald-50 border-emerald-200 text-emerald-700';
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resources for Year {user?.year} · {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-library-search"
          />
        </div>
        <div className="flex gap-2">
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="flex-1 h-9 text-sm" data-testid="select-course-filter">
              <Filter size={13} className="mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.code}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="flex-1 h-9 text-sm" data-testid="select-type-filter">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="notes">Notes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No resources match your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map(item => {
            const course = courses.find(c => c.id === item.course_id);
            const lecturer = lecturers.find(u => u.id === item.lecturer_id);
            return (
              <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2 rounded-lg border shrink-0', getTypeColor(item.type))}>
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-semibold leading-snug line-clamp-2">{item.title}</CardTitle>
                      <Badge variant="outline" className="mt-1.5 text-[10px] py-0 h-4 capitalize">{item.type}</Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-4 pb-3">
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={11} />
                      <span>{course?.code} — {course?.name}</span>
                    </div>
                    {lecturer && (
                      <div className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <span>{lecturer.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                      <span>Uploaded {format(new Date(item.uploaded_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="px-4 pb-4 pt-0 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 text-xs"
                    onClick={() => handleDownload(item)}
                    data-testid={`button-download-${item.id}`}
                  >
                    <Download size={13} className="mr-1.5" /> Download
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 h-8 text-xs"
                    onClick={() => setCommentItem(item)}
                    data-testid={`button-comment-${item.id}`}
                  >
                    <MessageSquare size={13} className="mr-1.5" /> Comments
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!commentItem} onOpenChange={(o) => !o && setCommentItem(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="line-clamp-2 text-base">{commentItem?.title}</DialogTitle>
          </DialogHeader>
          {commentItem && <CommentsThread assignmentId={commentItem.id} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
