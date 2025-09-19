import { scheduleCampaign } from '@/lib/klaviyo';
import { NextResponse } from 'next/server';
import { CampaignRequest } from '@/types/CampaignRequest';

type ScheduleRequest = CampaignRequest[];

export async function POST(request: Request) {
  try {
    const body: ScheduleRequest = await request.json();
    console.log(body);
    
    // Validate request body
    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { error: 'Request body must be a non-empty array of campaign requests' },
        { status: 400 }
      );
    }
    
    // Validate each campaign request
    for (let i = 0; i < body.length; i++) {
      const campaignRequest = body[i];
      
      if (!campaignRequest.campaignId || typeof campaignRequest.campaignId !== 'string' || campaignRequest.campaignId.trim().length === 0) {
        return NextResponse.json(
          { error: `Campaign request at index ${i} must have a valid campaignId` },
          { status: 400 }
        );
      }
      
      if (!campaignRequest.send_strategy || typeof campaignRequest.send_strategy !== 'object') {
        return NextResponse.json(
          { error: `Campaign request at index ${i} must have a valid send_strategy object` },
          { status: 400 }
        );
      }
      
      if (!campaignRequest.send_strategy.method || typeof campaignRequest.send_strategy.method !== 'string') {
        return NextResponse.json(
          { error: `Campaign request at index ${i} must have a valid send_strategy.method` },
          { status: 400 }
        );
      }
      
      // Validate that either date or datetime is provided for scheduling methods
      if (campaignRequest.send_strategy.method === 'scheduled' && 
          !campaignRequest.send_strategy.date && 
          !campaignRequest.send_strategy.datetime) {
        return NextResponse.json(
          { error: `Campaign request at index ${i} must have either send_strategy.date or send_strategy.datetime for scheduled method` },
          { status: 400 }
        );
      }
    }
    
    // Schedule each campaign individually
    const results = [];
    for (const campaignRequest of body) {
      const result = await scheduleCampaign(campaignRequest.campaignId, campaignRequest.send_strategy, campaignRequest.send_options);
      results.push(result);
    }
    
    // Wrap results in expected structure
    const allSuccessful = results.every(result => result.success);
    const result = {
      success: allSuccessful,
      results: results
    };
    
    console.log(result);
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error in schedule endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
