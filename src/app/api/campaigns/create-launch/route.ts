import { createCampaignForLaunch } from '@/lib/klaviyo';
import { NextResponse } from 'next/server';

interface Segment {
  id: string;
  name: string;
}

interface SegmentGroup {
  name: string;
  segmentsToInclude: Segment[];
  segmentsToExclude: Segment[];
}

interface LaunchConfiguration {
  id: number;
  campaignToClone: string;
  userType: string;
  audience: string;
  territory: string;
  test: string;
  excludedSegments: SegmentGroup | null;
}

interface CreateLaunchRequest {
  launchName: string;
  configurations: LaunchConfiguration[];
  audiences: any;
}

export async function POST(request: Request) {
  try {
    const body: CreateLaunchRequest = await request.json();
    console.log(body);
    console.log('Create launch request:', JSON.stringify(body, null, 2));
    
    // Validate request body
    if (!body.launchName || typeof body.launchName !== 'string' || body.launchName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Launch name is required and must be a non-empty string' },
        { status: 400 }
      );
    }
    
    if (!body.configurations || !Array.isArray(body.configurations) || body.configurations.length === 0) {
      return NextResponse.json(
        { error: 'Configurations must be a non-empty array' },
        { status: 400 }
      );
    }
    
   
    
    // Process each configuration
    const results = [];
    const createdCampaigns = [];
    
    for (const config of body.configurations) {
      try {
        // Create audiences object based on configuration
        const audiences = {
          included: config.excludedSegments?.segmentsToInclude || [],
          excluded: config.excludedSegments?.segmentsToExclude || []
        };

        console.log("Audiences for setup:", audiences);
        
        // Create new campaign name based on launch name and configuration
        const newCampaignName = `C | ${body.launchName} | ${config.userType} | ${config.territory} | ${config.test}`;
        
        // Call the createCampaignForLaunch function
        const result = await createCampaignForLaunch(
          config.campaignToClone,
          newCampaignName,
          audiences
        );
        
        results.push({
          configuration: config,
          result: result,
          success: result.success || false
        });
        
        if (result.success) {
          createdCampaigns.push({
            originalCampaignId: config.campaignToClone,
            newCampaignId: result.id,
            name: newCampaignName,
            userType: config.userType,
            audience: config.audience,
            territory: config.territory,
            test: config.test
          });
        }
        
      } catch (error) {
        console.error(`Error processing configuration for ${config.userType}:`, error);
        results.push({
          configuration: config,
          result: { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
          success: false
        });
      }
    }
    
    // Check if all campaigns were created successfully
    const allSuccessful = results.every(result => result.success);
    
    const response = {
      success: allSuccessful,
      launchName: body.launchName,
      totalConfigurations: body.configurations.length,
      successfulCampaigns: createdCampaigns.length,
      failedCampaigns: body.configurations.length - createdCampaigns.length,
      createdCampaigns: createdCampaigns,
      results: results
    };
    
    console.log('Create launch response:', JSON.stringify(response, null, 2));
    
    return NextResponse.json(response, { 
      status: allSuccessful ? 200 : 207 // 207 Multi-Status for partial success
    });
    
  } catch (error) {
    console.error('Error in create-launch endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
