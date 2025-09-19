'use client';

import { useState, useEffect, useTransition, use } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScheduledJob } from '@/types/ScheduledJob';

interface CampaignDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const resolvedParams = use(params);
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/campaigns/${resolvedParams.id}/jobs`);
        const data = await response.json();
        setScheduledJobs(data);
      } catch (error) {
        console.error('Failed to load scheduled jobs:', error);
      }
    });
  }, [resolvedParams.id]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleString();
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">
            Campaign Details
          </h1>
          <p className="text-muted-foreground">
            Campaign ID: {resolvedParams.id}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Scheduled Jobs</CardTitle>
            <CardDescription>
              {isPending ? 'Loading scheduled jobs...' : `${scheduledJobs.length} scheduled job(s) found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scheduledJobs.length > 0 ? (
              <div className="space-y-4">
                {scheduledJobs.map((job) => (
                  <Card key={job.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{job.name}</CardTitle>
                        <Badge variant={getStatusVariant(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                      <CardDescription className="font-mono">
                        Job ID: {job.id}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Scheduled At:</p>
                          <p className="text-muted-foreground">{formatDate(job.scheduledAt)}</p>
                        </div>
                        <div>
                          <p className="font-medium">Created At:</p>
                          <p className="text-muted-foreground">{formatDate(job.createdAt)}</p>
                        </div>
                        <div>
                          <p className="font-medium">Updated At:</p>
                          <p className="text-muted-foreground">{formatDate(job.updatedAt)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !isPending ? (
              <p className="text-muted-foreground text-center py-8">
                No scheduled jobs found for this campaign.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
