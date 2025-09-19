import { getCampaigns } from '@/lib/klaviyo';
import { NextResponse } from 'next/server';

export async function GET() {
  const campaigns = await getCampaigns();
  return NextResponse.json(campaigns);
}


