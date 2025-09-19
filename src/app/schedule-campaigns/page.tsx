'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Campaign } from '@/types/Campaign';
import SendStrategyOptions from '@/components/SendStrategyOptions';
import { toast } from 'sonner';
import { CampaignRequest } from '@/types/CampaignRequest';

function ScheduleCampaignsContent() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
  const [campaignsForSchedule, setCampaignsForSchedule] = useState<CampaignRequest[]>([])
  const [currentCampaign, setCurrentCampaign] = useState<CampaignRequest>({campaignId: '', send_strategy: {method: 'static'}, send_options: {use_smart_sending: false}});
  const [currentCampaignName, setCurrentCampaignName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, startSubmitTransition] = useTransition();



  const isCurrent = (campaignId: string) => {
    return campaignId === currentCampaign.campaignId;
  }

  const getCampaignName = (campaignId: string) => {
    const campaign = campaigns.filter(campaign => campaign.id === campaignId)[0];
    if(campaign) return campaign.name;
    return "";
  }

  const isStrategyComplete = (campaignId: string) => {
    const campaign = findCampaign(campaignId);
    if (!campaign || !campaign.send_strategy) return false;

    const { method, datetime, throttle_percentage, date, options } = campaign.send_strategy;

    switch (method) {
      case 'static':
        return !!(datetime && options?.is_local !== undefined);
      
      case 'throttled':
        return !!(datetime && throttle_percentage);
      
      case 'smart_send_time':
        return !!(date);

      case 'immediate':
        return true;
      
      default:
        return false;
    }
  };

  useEffect(() => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/campaigns');
        const data = await response.json();
        // Filter to show only draft campaigns
        const draftCampaigns = data.filter((campaign: Campaign) => campaign.status === 'Draft');
        setCampaigns(draftCampaigns);
      } catch (error) {
        console.error('Failed to load campaigns:', error);
      }
    });
  }, []);


  useEffect (() => {
    console.log(currentCampaign);
    setCurrentCampaignName(getCampaignName(currentCampaign.campaignId));
  }, [currentCampaign])

  useEffect(() => {
    if (currentCampaign.campaignId) {
      const updatedCampaign = findCampaign(currentCampaign.campaignId);
      if (updatedCampaign) {
        setCurrentCampaign(updatedCampaign);
      }
    }
    console.log(campaignsForSchedule);
  }, [campaignsForSchedule]);

  const handleCampaignToggle = (campaignId: string, checked: boolean) => {
    if (checked) {
      setSelectedCampaignIds(prev => [...prev, campaignId]);
      setCampaignsForSchedule((prev) => [...prev, {campaignId: campaignId, send_strategy: {method: 'static'}, send_options: {use_smart_sending: false}}])

    } else {
      setSelectedCampaignIds(prev => prev.filter(id => id !== campaignId));
      setCampaignsForSchedule(prev => prev.filter(campaign => campaign.campaignId !== campaignId))
    }
  };

  const findCampaign = (campaignId: string) => {
    return campaignsForSchedule.filter(campaign => campaign.campaignId === campaignId)[0];
  }  

  const updateCampaignStrategy = (campaignId: string, key: string, value: any) => {
    if(key !== 'use_smart_sending'){
      setCampaignsForSchedule(prev => 
        prev.map(campaign => 
          campaign.campaignId === campaignId 
            ? {
                ...campaign,
                send_strategy: {
                  ...campaign.send_strategy,
                  [key]: value
                }
              }
            : campaign
        )
      );
    }
    else {
      setCampaignsForSchedule(prev => 
        prev.map(campaign => 
          campaign.campaignId === campaignId 
            ? {
                ...campaign,
                send_strategy: {
                  ...campaign.send_strategy,
                },
                send_options: {
                  use_smart_sending: value
                }
              }
            : campaign
        )
      );
    }

    
  }

  const resetCampaignStrategy = (campaignId: string, method: string) => {
    setCampaignsForSchedule(prev => 
      prev.map(campaign => 
        campaign.campaignId === campaignId 
          ? {
              ...campaign,
              send_strategy: {
                method: method
              }
            }
          : campaign
      )
    );
  }

  

  const handleSubmit = () => {
    if (selectedCampaignIds.length === 0) {
      toast.error('Please select at least one campaign');
      return;
    }
  
    // Check if all selected campaigns are complete
    const incompleteCampaigns = selectedCampaignIds.filter(id => !isStrategyComplete(id));
    if (incompleteCampaigns.length > 0) {
      toast.error('Please complete the strategy configuration for all selected campaigns');
      return;
    }
  
    startSubmitTransition(async () => {
      try {
        // Use the campaignsForSchedule array directly
        const campaignRequests = campaignsForSchedule.filter(campaign => 
          selectedCampaignIds.includes(campaign.campaignId)
        );
  
        console.log('�� Sending campaign requests:', campaignRequests);
  
        const response = await fetch('/api/campaigns/schedule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(campaignRequests),
        });
  
        const result = await response.json();
  
        if (result.success) {
          toast.success(`Successfully scheduled ${selectedCampaignIds.length} campaign(s)`);
          setSelectedCampaignIds([]);
          setCampaignsForSchedule([]);
          setCurrentCampaign({campaignId: '', send_strategy: {method: 'static'}, send_options: {use_smart_sending: false}});
        } else {
          const failedCount = result.results.filter((r: any) => !r.success).length;
          toast.error(`Failed to schedule ${failedCount} out of ${selectedCampaignIds.length} campaigns`);
        }
      } catch (error) {
        console.error('Submit Error:', error);
        toast.error('Failed to schedule campaigns. Please try again.');
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">
          Schedule Campaigns
        </h1>
        <p className="text-muted-foreground">
          Select campaigns and schedule them to be sent at a specific time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
        {/* Left Column - Campaign Selection */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Select Draft Campaigns</CardTitle>
                  <CardDescription>
                    Choose which draft campaigns to schedule
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isPending ? (
                <p className="text-muted-foreground text-center py-8">
                  Loading campaigns...
                </p>
              ) : campaigns.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {campaigns.map((campaign) => {
                    const isSelected = selectedCampaignIds.includes(campaign.id);
                    
                    return (
                      <div
                        key={campaign.id}
                        className={"flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50"}
                      >
                        <Checkbox
                          id={campaign.id}
                          checked={isSelected}
                          onCheckedChange={(checked) => 
                            handleCampaignToggle(campaign.id, checked as boolean)
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <label
                            htmlFor={campaign.id}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {campaign.name}
                          </label>
                          
                        </div>
                        <div className="flex items-center gap-2">
                          {isSelected && <Button variant="outline" className='text-xs p-2' onClick={() => {setCurrentCampaign(findCampaign(campaign.id))}}>{isCurrent(campaign.id) ?'Selected': 'Select'}</Button>}
                          <Badge variant="outline">{campaign.status}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No draft campaigns found
                </p>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Strategy Configuration */}
        <div className="space-y-6">
          <SendStrategyOptions 
            currentCampaign={currentCampaign}
            currentCampaignName={currentCampaignName}
            updateStrategy={updateCampaignStrategy}
            resetStrategy={resetCampaignStrategy}

          />

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedCampaignIds.length === 0 || !selectedCampaignIds.every(id => isStrategyComplete(id))}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Campaigns'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ScheduleCampaignsPage() {
  return (
      <ScheduleCampaignsContent />
  );
}