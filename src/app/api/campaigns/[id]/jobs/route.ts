import { getScheduledJobs } from '@/lib/klaviyo';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const jobs = await getScheduledJobs(id);
  return NextResponse.json(jobs);
}
