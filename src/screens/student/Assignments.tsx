import { useState, useEffect } from 'react';
import { getDb, saveDb } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CommentsThread } from '@/components/CommentsThread';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Clock, User, BookOpen, CheckCircle2, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'assignments' | 'quizzes';

interface QuizState {
  answers: Record<string, number>;
  submitted: boolean;
  score: number;
}

export default function StudentAssignments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('assignments');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [quizStates, setQuizStates] = useState<Record<string, QuizState>>({});
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);

  const loadData = () => {
    if (!user) return;
    const db = getDb();
    setAssignments(db.assignments.filter((a: any) => user.courses?.includes(a.course_id)));
    setSubmissions(db.submissions.filter((s: any) => s.student_id === user.id));
    setCourses(db.courses);
    setUsers(db.users);
    setQuizAttempts((db.quiz_attempts || []).filter((qa: any) => qa.student_id === user.id));
  };

  useEffect(() => { loadData(); }, [user]);

  const handleSubmitAssignment = (assignmentId: string) => {
    const db = getDb();
    db.submissions.push({
      id: `s${Date.now()}`,
      assignment_id: assignmentId,
      student_id: user?.id,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    });
    saveDb(db);
    loadData();
    toast({ title: 'Submitted', description: 'Your assignment has been recorded.' });
  };

  const handleAnswerChange = (quizId: string, questionId: string, optionIdx: number) => {
    setQuizStates(prev => ({
      ...prev,
      [quizId]: {
        ...prev[quizId],
        answers: { ...(prev[quizId]?.answers || {}), [questionId]: optionIdx },
        submitted: false,
        score: 0,
      }
    }));
  };

  const handleSubmitQuiz = (assignment: any) => {
    const qs = quizStates[assignment.id];
    if (!qs) return;
    const questions = assignment.questions || [];
    if (questions.length === 0) return;

    const correct = questions.filter((q: any) => qs.answers[q.id] === q.correct).length;
    const score = Math.round((correct / questions.length) * 100);

    const db = getDb();
    if (!db.quiz_attempts) db.quiz_attempts = [];
    db.quiz_attempts.push({
      id: `qa${Date.now()}`,
      quiz_id: assignment.id,
      student_id: user?.id,
      answers: qs.answers,
      score,
      completed_at: new Date().toISOString(),
    });

    const existingSubmission = db.submissions.find((s: any) => s.assignment_id === assignment.id && s.student_id === user?.id);
    if (!existingSubmission) {
      db.submissions.push({
        id: `s${Date.now()}`,
        assignment_id: assignment.id,
        student_id: user?.id,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        grade: String(score),
      });
    }
    saveDb(db);

    setQuizStates(prev => ({
      ...prev,
      [assignment.id]: { ...qs, submitted: true, score }
    }));
    loadData();
    toast({ title: 'Quiz Submitted', description: `You scored ${score}%.` });
  };

  const handleRetakeQuiz = (quizId: string) => {
    setQuizStates(prev => ({
      ...prev,
      [quizId]: { answers: {}, submitted: false, score: 0 }
    }));
  };

  const filtered = assignments.filter(a => a.type === (activeTab === 'assignments' ? 'assignment' : 'quiz'));
  const totalAssignments = assignments.filter(a => a.type === 'assignment').length;
  const totalQuizzes = assignments.filter(a => a.type === 'quiz').length;
  const doneAssignments = submissions.filter(s => assignments.find(a => a.id === s.assignment_id && a.type === 'assignment')).length;
  const doneQuizzes = quizAttempts.length;

  const getStatusBadge = (assignment: any) => {
    const sub = submissions.find(s => s.assignment_id === assignment.id);
    const isLate = new Date() > new Date(assignment.deadline) && !sub;
    if (!sub && isLate) return <Badge variant="destructive" className="text-xs">Late</Badge>;
    if (!sub) return <Badge variant="secondary" className="text-xs">Pending</Badge>;
    if (sub.status === 'graded') return <Badge className="bg-emerald-600 hover:bg-emerald-600 text-xs">Graded {sub.grade ? `· ${sub.grade}%` : ''}</Badge>;
    return <Badge className="bg-blue-600 hover:bg-blue-600 text-xs">Submitted</Badge>;
  };

  const getQuizStatus = (assignment: any) => {
    const attempt = quizAttempts.find(qa => qa.quiz_id === assignment.id);
    const localState = quizStates[assignment.id];
    if (localState?.submitted) return { label: `Score: ${localState.score}%`, color: 'bg-emerald-600' };
    if (attempt) return { label: `Score: ${attempt.score}%`, color: 'bg-emerald-600' };
    if (new Date() > new Date(assignment.deadline)) return { label: 'Missed', color: 'bg-red-600' };
    return { label: 'Not Started', color: '' };
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assignments & Quizzes</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your work and take quizzes</p>
      </div>

      <div className="flex gap-2 items-center">
        <div className="flex bg-muted rounded-lg p-1 gap-1">
          <button
            onClick={() => setActiveTab('assignments')}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
              activeTab === 'assignments' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
            data-testid="tab-assignments"
          >
            Assignments
            <span className="ml-1.5 text-xs font-normal opacity-60">{doneAssignments}/{totalAssignments}</span>
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
              activeTab === 'quizzes' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
            data-testid="tab-quizzes"
          >
            Quizzes
            <span className="ml-1.5 text-xs font-normal opacity-60">{doneQuizzes}/{totalQuizzes}</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No {activeTab} found for your courses.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(assignment => {
            const course = courses.find(c => c.id === assignment.course_id);
            const lecturer = users.find(u => u.id === assignment.lecturer_id);
            const sub = submissions.find(s => s.assignment_id === assignment.id);
            const isLate = new Date() > new Date(assignment.deadline);
            const isQuiz = assignment.type === 'quiz';
            const quizStatus = isQuiz ? getQuizStatus(assignment) : null;
            const attempt = quizAttempts.find(qa => qa.quiz_id === assignment.id);
            const localQuizState = quizStates[assignment.id];
            const hasAttempt = attempt || localQuizState?.submitted;
            const canRetake = assignment.allow_retake && hasAttempt;

            return (
              <Card key={assignment.id} className={cn(
                'overflow-hidden transition-shadow hover:shadow-md',
                isLate && !sub && !hasAttempt && 'border-destructive/40'
              )}>
                <CardHeader className="pb-3 pt-4 px-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold leading-snug line-clamp-2">{assignment.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <BookOpen size={11} />
                          {course?.code} — {course?.name}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User size={11} />
                          {lecturer?.name}
                        </span>
                      </div>
                    </div>
                    {isQuiz
                      ? <Badge className={cn('text-xs shrink-0', quizStatus?.color || 'bg-secondary text-secondary-foreground hover:bg-secondary')}>{quizStatus?.label}</Badge>
                      : getStatusBadge(assignment)
                    }
                  </div>
                </CardHeader>

                <CardContent className="px-4 pb-3">
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{assignment.description}</p>

                  {sub?.feedback && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-md text-sm">
                      <span className="font-medium text-emerald-800">Feedback:</span>
                      <span className="text-emerald-700 ml-1">{sub.feedback}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 mt-3">
                    <Clock size={12} className={cn('text-muted-foreground', isLate && 'text-destructive')} />
                    <span className={cn('text-xs', isLate ? 'text-destructive font-medium' : 'text-muted-foreground')}>
                      {isLate ? 'Was due' : 'Due'} {format(new Date(assignment.deadline), 'MMM d, yyyy · h:mm a')}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="px-4 pb-4 pt-0 gap-2 flex-wrap">
                  {!isQuiz && !sub && !isLate && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleSubmitAssignment(assignment.id)}
                      data-testid={`button-submit-${assignment.id}`}
                    >
                      <CheckCircle2 size={14} className="mr-1.5" /> Submit Work
                    </Button>
                  )}

                  {isQuiz && !hasAttempt && !isLate && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="flex-1" data-testid={`button-take-quiz-${assignment.id}`}>
                          Take Quiz
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                        <QuizModal
                          assignment={assignment}
                          quizState={localQuizState}
                          onAnswerChange={handleAnswerChange}
                          onSubmit={handleSubmitQuiz}
                          onRetake={handleRetakeQuiz}
                        />
                      </DialogContent>
                    </Dialog>
                  )}

                  {isQuiz && (hasAttempt || localQuizState?.submitted) && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="flex-1" data-testid={`button-view-result-${assignment.id}`}>
                          View Result
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                        <QuizModal
                          assignment={assignment}
                          quizState={localQuizState || { answers: attempt?.answers || {}, submitted: true, score: attempt?.score || 0 }}
                          onAnswerChange={handleAnswerChange}
                          onSubmit={handleSubmitQuiz}
                          onRetake={handleRetakeQuiz}
                        />
                      </DialogContent>
                    </Dialog>
                  )}

                  {isQuiz && canRetake && (
                    <Button size="sm" variant="ghost" onClick={() => handleRetakeQuiz(assignment.id)} data-testid={`button-retake-${assignment.id}`}>
                      <RefreshCw size={13} className="mr-1.5" /> Retake
                    </Button>
                  )}

                  <Dialog open={openCommentId === assignment.id} onOpenChange={(o) => setOpenCommentId(o ? assignment.id : null)}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="ghost" data-testid={`button-comments-${assignment.id}`}>
                        <MessageSquare size={13} className="mr-1.5" /> Comments
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="line-clamp-1">{assignment.title}</DialogTitle>
                      </DialogHeader>
                      <CommentsThread assignmentId={assignment.id} />
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function QuizModal({ assignment, quizState, onAnswerChange, onSubmit, onRetake }: {
  assignment: any;
  quizState: QuizState | undefined;
  onAnswerChange: (quizId: string, questionId: string, idx: number) => void;
  onSubmit: (assignment: any) => void;
  onRetake: (quizId: string) => void;
}) {
  const questions = assignment.questions || [];
  const answered = Object.keys(quizState?.answers || {}).length;
  const isSubmitted = quizState?.submitted;

  if (questions.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No questions available for this quiz yet.</p>
      </div>
    );
  }

  if (isSubmitted) {
    const score = quizState?.score ?? 0;
    const correct = questions.filter((q: any) => quizState?.answers[q.id] === q.correct).length;
    return (
      <div className="space-y-5">
        <DialogHeader>
          <DialogTitle>Quiz Result — {assignment.title}</DialogTitle>
        </DialogHeader>
        <div className="text-center py-4">
          <div className={cn(
            "text-5xl font-bold mb-2",
            score >= 70 ? 'text-emerald-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'
          )}>
            {score}%
          </div>
          <p className="text-muted-foreground text-sm">{correct} of {questions.length} correct</p>
          <Progress value={score} className="mt-3 h-2" />
        </div>
        <div className="space-y-4">
          {questions.map((q: any, i: number) => {
            const selected = quizState?.answers[q.id];
            const isCorrect = selected === q.correct;
            return (
              <div key={q.id} className={cn('p-3 rounded-lg border text-sm', isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200')}>
                <p className="font-medium mb-2">{i + 1}. {q.question}</p>
                <div className="space-y-1">
                  {q.options.map((opt: string, idx: number) => (
                    <div key={idx} className={cn(
                      'px-2 py-1 rounded text-xs',
                      idx === q.correct && 'bg-emerald-200 font-semibold text-emerald-900',
                      idx === selected && idx !== q.correct && 'bg-red-200 line-through text-red-800',
                    )}>
                      {String.fromCharCode(65 + idx)}. {opt}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {assignment.allow_retake && (
          <Button variant="outline" className="w-full" onClick={() => onRetake(assignment.id)}>
            <RefreshCw size={14} className="mr-2" /> Retake Quiz
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <DialogHeader>
        <DialogTitle>{assignment.title}</DialogTitle>
      </DialogHeader>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{questions.length} questions</span>
        <span className="text-muted-foreground">{answered}/{questions.length} answered</span>
      </div>
      <Progress value={(answered / questions.length) * 100} className="h-1.5" />

      <div className="space-y-6">
        {questions.map((q: any, i: number) => (
          <div key={q.id} className="space-y-2.5">
            <p className="text-sm font-medium leading-snug">{i + 1}. {q.question}</p>
            <RadioGroup
              value={quizState?.answers[q.id] !== undefined ? String(quizState.answers[q.id]) : undefined}
              onValueChange={(val) => onAnswerChange(assignment.id, q.id, Number(val))}
            >
              {q.options.map((opt: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-md border border-transparent hover:border-border hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value={String(idx)} id={`${q.id}-${idx}`} data-testid={`radio-${q.id}-${idx}`} />
                  <Label htmlFor={`${q.id}-${idx}`} className="cursor-pointer text-sm leading-snug">
                    <span className="font-medium mr-1">{String.fromCharCode(65 + idx)}.</span> {opt}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
      </div>

      <Button
        className="w-full"
        disabled={answered < questions.length}
        onClick={() => onSubmit(assignment)}
        data-testid="button-submit-quiz"
      >
        {answered < questions.length ? `Answer all questions (${answered}/${questions.length})` : 'Submit Quiz'}
      </Button>
    </div>
  );
}
