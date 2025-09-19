import { getCampaigns } from '@/lib/klaviyo';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const allCampaigns = await getCampaigns();
    
    // Filter campaigns with 'Sent' status
    const sentCampaigns = allCampaigns.filter(campaign => campaign.status === 'Sent');
    
    return NextResponse.json({
      success: true,
      data: sentCampaigns,
      count: sentCampaigns.length
    });
    
  } catch (error) {
    console.error('Error fetching sent campaigns:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch sent campaigns',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
