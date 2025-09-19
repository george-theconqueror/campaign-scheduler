import { Campaign } from '@/types/Campaign';
import { ScheduledJob } from '@/types/ScheduledJob';

export async function getCampaigns(): Promise<Campaign[]> {
  const response = await fetch('https://a.klaviyo.com/api/campaigns?filter=equals(messages.channel,\'email\')', {
    headers: {
      'Authorization': `Klaviyo-API-Key ${process.env.KLAVIYO_API_KEY}`,
       'accept': 'application/vnd.api+json',
      'revision': '2025-07-15',    
    },
  });

  const data = await response.json();
 
  
  return data.data.map((campaign: any) => ({
    id: campaign.id,
    name: campaign.attributes.name,
    status: campaign.attributes.status
  }
));
}





export async function getScheduledJobs(id: string): Promise<ScheduledJob[]> {
  const response = await fetch(`https://a.klaviyo.com/api/campaign-send-jobs/${id}`, {
    headers: {
      'Authorization': `Klaviyo-API-Key ${process.env.KLAVIYO_API_KEY}`,
      'accept': 'application/vnd.api+json',
      'revision': '2025-07-15',    
    },
  });

  const data = await response.json();
  
  console.log('Scheduled jobs API response:', JSON.stringify(data, null, 2));
  
  // Check if response has data property
  if (!data.data) {
    console.log('No data property in scheduled jobs response:', data);
    return [];
  }
  
  // Handle both single object and array cases
  const jobs = Array.isArray(data.data) ? data.data : [data.data];
  
  return jobs.map((job: any) => ({
    id: job.id,
    status: job.attributes.status || 'unknown',
    scheduledAt: job.attributes.scheduled_at,
    createdAt: job.attributes.created_at,
    updatedAt: job.attributes.updated_at,
  }));
}

export async function scheduleCampaign(campaignId: string, send_strategy: any, send_options: any) {
  try {
    const requestBody = {
      data: {
        type: 'campaign',
        id: campaignId,
        attributes: {
          send_strategy: send_strategy,
          send_options: send_options
        }
      }
    };

    const response = await fetch(`https://a.klaviyo.com/api/campaigns/${campaignId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Klaviyo-API-Key ${process.env.KLAVIYO_API_KEY}`,
        'accept': 'application/vnd.api+json',
        'revision': '2025-07-15',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const responseData = await response.json();
    console.log('Klaviyo API response:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      const sendJobBody = {
          data: {
              type: 'campaign-send-job',
              id: `${campaignId}`
          }
      }

      const sendJobResponse = await fetch(`https://a.klaviyo.com/api/campaign-send-jobs`, {
          method: 'POST',
          headers: {
            'Authorization': `Klaviyo-API-Key ${process.env.KLAVIYO_API_KEY}`,
            'accept': 'application/vnd.api+json',
            'revision': '2025-07-15',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sendJobBody)
        });
      
      const jobResponse = await sendJobResponse.json();
      console.log(jobResponse);

      if (sendJobResponse.ok) {
        console.log(`✅ Campaign ${campaignId} scheduled successfully`);
        return { id: campaignId, success: true };
      } else {
        return { 
          id: campaignId, 
          success: false, 
          error: jobResponse.errors?.[0]?.detail || `HTTP ${sendJobResponse.status}` 
        };
      }
    } else {
      return { 
        id: campaignId, 
        success: false, 
        error: responseData.errors?.[0]?.detail || `HTTP ${response.status}` 
      };
    }
  } catch (error) {
    return { id: campaignId, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}


export async function rescheduleCampaign(campaignId: string, send_strategy: any, send_options: any) {
  try {
    console.log(`🔄 Starting reschedule process for campaign ${campaignId}`);
    
    const revertResponse = await fetch(`https://a.klaviyo.com/api/campaign-send-jobs/${campaignId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Klaviyo-API-Key ${process.env.KLAVIYO_API_KEY}`,
        'accept': 'application/vnd.api+json',
        'revision': '2025-07-15',
        'Content-Type': 'application/json',
      },
    });

    const revertData = await revertResponse.json();
    console.log('Revert job API response:', JSON.stringify(revertData, null, 2));

    if (!revertResponse.ok) {
      console.error(`❌ Failed to cancel existing job for campaign ${campaignId}:`, revertData);
      return { 
        id: campaignId, 
        success: false, 
        error: revertData.errors?.[0]?.detail || `Failed to cancel existing job: HTTP ${revertResponse.status}` 
      };
    }

    console.log(`✅ Successfully canceled existing job for campaign ${campaignId}`);

    // Step 2: Schedule the campaign with new strategy
    console.log(`📅 Scheduling campaign ${campaignId} with new strategy`);
    const rescheduleResponse = await scheduleCampaign(campaignId, send_strategy, send_options);
    
    if (rescheduleResponse.success) {
      console.log(`✅ Successfully rescheduled campaign ${campaignId}`);
      return rescheduleResponse;
    } else {
      console.error(`❌ Failed to reschedule campaign ${campaignId}:`, rescheduleResponse.error);
      return rescheduleResponse;
    }

  } catch (error) {
    console.error(`💥 Error during reschedule process for campaign ${campaignId}:`, error);
    return { 
      id: campaignId, 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error during reschedule' 
    };
  }
}



export async function getSegments() {
  const response = await fetch('https://a.klaviyo.com/api/segments', {
    method: 'GET',
    headers: {
      accept: 'application/vnd.api+json',
      revision: '2025-07-15',
      'Authorization': `Klaviyo-API-Key ${process.env.KLAVIYO_API_KEY}`,
    }
  }).then(res => res.json());

  const segments = response.data.map((segment: any) => {
    return {
      id: segment.id,
      name: segment.attributes.name
    }
  });
  return segments;
}

export async function createCampaignForLaunch(campaignId: string, new_name: string, audiences: any) {
   // first clone the campaign with the new name, then update it to new audiences
  const cloneRequestBody = {
    data: {
      type: "campaign",
      id: campaignId,
      attributes: {
        new_name: new_name
      }
    },
  };

  const cloneResponse = await fetch('https://a.klaviyo.com/api/campaign-clone', {
    method: 'POST',
    headers: {
      accept: 'application/vnd.api+json',
      revision: '2025-07-15',
      'content-type': 'application/vnd.api+json',
      'Authorization': `Klaviyo-API-Key ${process.env.KLAVIYO_API_KEY}`,
    },
    body: JSON.stringify(cloneRequestBody)
  }).then(res => res.json());

  console.log("Created Campaign Data: ", cloneResponse);
  const newId = cloneResponse.data.id;
  const currentAudiences = cloneResponse.data.attributes.audiences;

  console.log("Current Audiences:", currentAudiences);

  const updateRequestBody = {
    data: {
      type: "campaign",
      id:newId,
      attributes: {
        audiences: audiences
      }
    }
  };

  const updateNewCampaignResponse = await fetch(`https://a.klaviyo.com/api/campaigns/${newId}`, {
    method: 'PATCH',
    headers: {
      accept: 'application/vnd.api+json',
      revision: '2025-07-15',
      'content-type': 'application/vnd.api+json',
      'Authorization': `Klaviyo-API-Key ${process.env.KLAVIYO_API_KEY}`
    },
    body: JSON.stringify(updateRequestBody)
  }).then(res => res.json());

  console.log("Updated Audiences:", updateNewCampaignResponse);

  return {
    success: true,
    id: updateNewCampaignResponse.id,
    name: updateNewCampaignResponse.name,
  }
}




