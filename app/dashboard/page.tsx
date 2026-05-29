import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  FileText,
  LineChart,
  Target,
  TrendingUp,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { authOptions } from '@/src/lib/auth';
import { getDashboardStats } from '@/src/controllers/user.controller';
import JourneyMap from '@/components/JourneyMap';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/empty-state';

export const dynamic = 'force-dynamic';

type DashboardData = Awaited<ReturnType<typeof getDashboardStats>>;

function formatDate(value?: string | Date | null) {
  if (!value) return 'No activity yet';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'No activity yet';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = 'primary',
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
  tone?: 'primary' | 'success' | 'warning' | 'destructive' | 'info';
}) {
  const tones = {
    primary: 'border-primary/25 bg-primary/10 text-primary',
    success: 'border-success/25 bg-success/10 text-success',
    warning: 'border-warning/25 bg-warning/10 text-warning',
    destructive: 'border-destructive/25 bg-destructive/10 text-destructive',
    info: 'border-info/25 bg-info/10 text-info',
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-caption uppercase text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="mt-1 text-body-sm text-muted-foreground">{helper}</p>
        </div>
        <span className={`rounded-md border p-2 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );
}

function ProgressRows({ data }: { data: DashboardData }) {
  if (data.perSubject.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title="No progress yet"
        description="Start a lesson to create your first saved progress record."
        className="p-6"
      />
    );
  }

  return (
    <div className="space-y-3">
      {data.perSubject.map((item) => {
        const completed = item.completed ?? 0;
        const total = item.totalSubtopics ?? 0;
        const done = percent(completed, total);
        return (
          <div key={item._id} className="rounded-xl border border-border bg-surface-1/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{item._id}</p>
                <p className="text-caption text-muted-foreground">
                  {completed}/{total} subtopics complete
                </p>
              </div>
              <span className="font-mono text-body-sm text-foreground">{done}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: `${done}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActivityTimeline({ data }: { data: DashboardData }) {
  const max = Math.max(1, ...data.attempts.timeline.map((item) => item.attempts));

  if (data.attempts.timeline.length === 0) {
    return (
      <EmptyState
        icon={LineChart}
        title="No timeline yet"
        description="Submission activity will appear after your first attempt."
        className="p-6"
      />
    );
  }

  return (
    <div className="flex h-44 items-end gap-2">
      {data.attempts.timeline.map((item) => (
        <div key={item.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div
            className="w-full rounded-t-md bg-primary/80 transition-colors hover:bg-primary"
            style={{ height: `${Math.max(10, (item.attempts / max) * 140)}px` }}
            title={`${item.attempts} attempts, avg ${item.averageScore}%`}
          />
          <span className="w-full truncate text-center text-[10px] text-muted-foreground">
            {item.date.slice(5)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard');
  }

  const data = await getDashboardStats(session.user.id);
  const totalAttempts = data.attempts.summary.total;
  const successRate = percent(data.attempts.summary.successful, totalAttempts);
  const completedSubtopics = data.totals.completed;
  const pendingSubtopics = Math.max(0, data.totals.totalSubtopics - completedSubtopics);

  return (
    <main className="page-shell">
      <div className="page-container space-y-8">
        <header className="flex flex-col gap-4 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-eyebrow uppercase text-muted-foreground">
              {data.user.role} dashboard
            </p>
            <h1 className="mt-2 text-h1 text-foreground">
              {data.user.name}&apos;s learning dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-body text-muted-foreground">
              Your saved submissions, progress, wrong answers, and recent learning activity from MongoDB.
            </p>
          </div>
          <div className="surface-panel px-4 py-3 text-right">
            <p className="text-caption uppercase text-muted-foreground">Last active</p>
            <p className="mt-1 text-body-sm font-medium text-foreground">
              {formatDate(data.user.lastActiveAt ?? data.attempts.summary.lastAttemptAt)}
            </p>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total submissions"
            value={totalAttempts}
            helper={`${data.attempts.summary.successful} solved, ${data.attempts.summary.failed} failed`}
            icon={FileText}
            tone="primary"
          />
          <StatCard
            label="Success rate"
            value={`${successRate}%`}
            helper="Accepted or completed attempts"
            icon={CheckCircle2}
            tone="success"
          />
          <StatCard
            label="Average score"
            value={`${data.attempts.summary.averageScore}%`}
            helper={`Best score ${data.attempts.summary.bestScore}%`}
            icon={TrendingUp}
            tone="info"
          />
          <StatCard
            label="Pending items"
            value={pendingSubtopics}
            helper={`${completedSubtopics} completed progress records`}
            icon={Clock}
            tone="warning"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>Submission timeline</CardTitle>
                <CardDescription>Last 14 days</CardDescription>
              </div>
              <LineChart className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ActivityTimeline data={data} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>Attempt mix</CardTitle>
                <CardDescription>By activity type</CardDescription>
              </div>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
            <div className="space-y-3">
              {data.attempts.byType.length === 0 ? (
                <EmptyState icon={BarChart3} title="No attempts yet" description="Your activity mix will populate as you practice." className="p-6" />
              ) : (
                data.attempts.byType.map((item) => {
                  const width = percent(item.count, totalAttempts);
                  return (
                    <div key={item.type}>
                      <div className="mb-1 flex items-center justify-between text-body-sm">
                        <span className="capitalize text-foreground">{item.type}</span>
                        <span className="font-mono text-muted-foreground">{item.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-info" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>Progress cards</CardTitle>
                <CardDescription>Mongo Progress collection</CardDescription>
              </div>
              <Target className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ProgressRows data={data} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>Recent activity</CardTitle>
                <CardDescription>Latest saved attempts</CardDescription>
              </div>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
            <div className="space-y-3">
              {data.attempts.recent.length === 0 ? (
                <EmptyState
                  icon={Activity}
                  title="No recent activity"
                  description="Complete a MCQ, coding, SQL, or assignment challenge to see history."
                  className="p-6"
                />
              ) : (
                data.attempts.recent.map((attempt) => {
                  const passed = attempt.status === 'accepted' || attempt.status === 'completed';
                  return (
                    <div
                      key={attempt.id}
                      className="rounded-xl border border-border bg-surface-1/80 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{attempt.problemTitle}</p>
                          <p className="mt-1 text-caption text-muted-foreground">
                            {attempt.subjectName ?? 'Learning'} / {attempt.subtopicName ?? attempt.phase ?? attempt.type}
                          </p>
                        </div>
                        <span
                          className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-caption ${
                            passed
                              ? 'border-success/25 bg-success/10 text-success'
                              : 'border-destructive/25 bg-destructive/10 text-destructive'
                          }`}
                        >
                          {passed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                          {attempt.score}%
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-caption text-muted-foreground">
                        <span className="capitalize">{attempt.type}</span>
                        <span>·</span>
                        <span>{attempt.status.replace(/_/g, ' ')}</span>
                        <span>·</span>
                        <span>{formatDate(attempt.createdAt)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Weak topics</CardTitle>
              <CardDescription>Topics with recent wrong or failed attempts</CardDescription>
            </div>
            <XCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
          {data.attempts.weakTopics.length === 0 ? (
            <EmptyState icon={XCircle} title="No weak-topic signal yet" description="Wrong or failed attempts will surface here for targeted review." className="p-6" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data.attempts.weakTopics.map((topic) => (
                <div
                  key={`${topic.subjectId}-${topic.unitId}-${topic.subtopicId}`}
                  className="rounded-xl border border-border bg-surface-1/80 p-4"
                >
                  <p className="font-medium text-foreground">{topic.subtopicName ?? topic.subtopicId}</p>
                  <p className="mt-1 text-caption text-muted-foreground">
                    {topic.subjectName ?? topic.subjectId} / {topic.unitName ?? topic.unitId}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-body-sm">
                    <span className="text-destructive">{topic.failedCount} failed</span>
                    <span className="font-mono text-muted-foreground">{topic.averageScore}% avg</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          </CardContent>
        </Card>

        <section id="learning-paths" className="border-t border-border pt-8">
          <JourneyMap />
        </section>
      </div>
    </main>
  );
}
