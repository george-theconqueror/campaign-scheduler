'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Campaign } from '@/types/Campaign';
import { CampaignsSkeleton } from '@/components/CampaignSkeleton';

// Function to get badge variant based on campaign status
function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  const normalizedStatus = status.toLowerCase();
  
  switch (normalizedStatus) {
    case 'draft':
      return 'outline';
    case 'scheduled':
    case 'pending':
      return 'secondary';
    case 'sent':
    case 'completed':
    case 'active':
      return 'default';
    case 'cancelled':
    case 'failed':
    case 'error':
      return 'destructive';
    default:
      return 'outline';
  }
}

// Function to get display text for status
function getStatusDisplayText(status: string): string {
  const normalizedStatus = status.toLowerCase();
  
  switch (normalizedStatus) {
    case 'draft':
      return 'Draft';
    case 'scheduled':
      return 'Scheduled';
    case 'pending':
      return 'Pending';
    case 'sent':
      return 'Sent';
    case 'completed':
      return 'Completed';
    case 'active':
      return 'Active';
    case 'cancelled':
      return 'Cancelled';
    case 'failed':
      return 'Failed';
    case 'error':
      return 'Error';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [draftedCampaigns, setDraftedCampaigns] = useState<Campaign[]>([]);
  const [scheduledCampaigns, setScheduledCampaigns] = useState<Campaign[]>([]);
  const [filteredDraftedCampaigns, setFilteredDraftedCampaigns] = useState<Campaign[]>([]);
  const [filteredScheduledCampaigns, setFilteredScheduledCampaigns] = useState<Campaign[]>([]);
  const [draftedSearchQuery, setDraftedSearchQuery] = useState('');
  const [scheduledSearchQuery, setScheduledSearchQuery] = useState('');
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [isActionPending, startActionTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/campaigns');
        const data = await response.json();
        setCampaigns(data);
        
        // Split campaigns into drafted and scheduled
        const drafted = data.filter((campaign: Campaign) => campaign.status.toLowerCase() === 'draft');
        const scheduled = data.filter((campaign: Campaign) => campaign.status.toLowerCase() !== 'draft');
        
        setDraftedCampaigns(drafted);
        setScheduledCampaigns(scheduled);
        setFilteredDraftedCampaigns(drafted);
        setFilteredScheduledCampaigns(scheduled);
      } catch (error) {
        console.error('Failed to load campaigns:', error);
      }
    });
  }, []);

  // Filter drafted campaigns
  useEffect(() => {
    const filtered = draftedCampaigns.filter(campaign =>
      campaign.name.toLowerCase().includes(draftedSearchQuery.toLowerCase())
    );
    setFilteredDraftedCampaigns(filtered);
  }, [draftedCampaigns, draftedSearchQuery]);

  // Filter scheduled campaigns
  useEffect(() => {
    const filtered = scheduledCampaigns.filter(campaign =>
      campaign.name.toLowerCase().includes(scheduledSearchQuery.toLowerCase())
    );
    setFilteredScheduledCampaigns(filtered);
  }, [scheduledCampaigns, scheduledSearchQuery]);

  // Clear selections when campaigns change
  useEffect(() => {
    setSelectedCampaigns(new Set());
  }, [campaigns]);

  // Selection handlers
  const handleSelectCampaign = (campaignId: string, checked: boolean) => {
    setSelectedCampaigns(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(campaignId);
      } else {
        newSet.delete(campaignId);
      }
      return newSet;
    });
  };

  const handleSelectAllDrafted = (checked: boolean) => {
    setSelectedCampaigns(prev => {
      const newSet = new Set(prev);
      if (checked) {
        filteredDraftedCampaigns.forEach(c => newSet.add(c.id));
      } else {
        filteredDraftedCampaigns.forEach(c => newSet.delete(c.id));
      }
      return newSet;
    });
  };

  const handleSelectAllScheduled = (checked: boolean) => {
    setSelectedCampaigns(prev => {
      const newSet = new Set(prev);
      if (checked) {
        filteredScheduledCampaigns.forEach(c => newSet.add(c.id));
      } else {
        filteredScheduledCampaigns.forEach(c => newSet.delete(c.id));
      }
      return newSet;
    });
  };

  const isAllDraftedSelected = filteredDraftedCampaigns.length > 0 && 
    filteredDraftedCampaigns.every(c => selectedCampaigns.has(c.id));
  const isDraftedIndeterminate = filteredDraftedCampaigns.some(c => selectedCampaigns.has(c.id)) && 
    !isAllDraftedSelected;

  const isAllScheduledSelected = filteredScheduledCampaigns.length > 0 && 
    filteredScheduledCampaigns.every(c => selectedCampaigns.has(c.id));
  const isScheduledIndeterminate = filteredScheduledCampaigns.some(c => selectedCampaigns.has(c.id)) && 
    !isAllScheduledSelected;

  // Action handlers
  const handleCancelCampaigns = () => {
    startActionTransition(async () => {
      try {
        const response = await fetch('/api/campaigns/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignIds: Array.from(selectedCampaigns) })
        });
        
        if (response.ok) {
          // Refresh campaigns
          const campaignsResponse = await fetch('/api/campaigns');
          const data = await campaignsResponse.json();
          setCampaigns(data);
          
          // Split campaigns into drafted and scheduled
          const drafted = data.filter((campaign: Campaign) => campaign.status.toLowerCase() === 'draft');
          const scheduled = data.filter((campaign: Campaign) => campaign.status.toLowerCase() !== 'draft');
          
          setDraftedCampaigns(drafted);
          setScheduledCampaigns(scheduled);
          setFilteredDraftedCampaigns(drafted);
          setFilteredScheduledCampaigns(scheduled);
          setSelectedCampaigns(new Set());
        }
      } catch (error) {
        console.error('Failed to cancel campaigns:', error);
      }
    });
  };

  const handleRevertToDraft = () => {
    startActionTransition(async () => {
      try {
        const response = await fetch('/api/campaigns/revert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignIds: Array.from(selectedCampaigns) })
        });
        
        if (response.ok) {
          // Refresh campaigns
          const campaignsResponse = await fetch('/api/campaigns');
          const data = await campaignsResponse.json();
          setCampaigns(data);
          
          // Split campaigns into drafted and scheduled
          const drafted = data.filter((campaign: Campaign) => campaign.status.toLowerCase() === 'draft');
          const scheduled = data.filter((campaign: Campaign) => campaign.status.toLowerCase() !== 'draft');
          
          setDraftedCampaigns(drafted);
          setScheduledCampaigns(scheduled);
          setFilteredDraftedCampaigns(drafted);
          setFilteredScheduledCampaigns(scheduled);
          setSelectedCampaigns(new Set());
        }
      } catch (error) {
        console.error('Failed to revert campaigns:', error);
      }
    });
  };

  return (
    <div className="container mx-auto py-8 pb-20">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">
            Klaviyo Campaigns
          </h1>
        </div>

        {isPending ? (
          <CampaignsSkeleton />
        ) : (
          <>
            {/* Drafted Campaigns Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Drafted Campaigns</h2>
            <div className="w-80">
              <Input
                type="text"
                placeholder="Search drafted campaigns..."
                value={draftedSearchQuery}
                onChange={(e) => setDraftedSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
          {filteredDraftedCampaigns.length > 0 && (
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="select-all-drafted"
                checked={isAllDraftedSelected}
                onCheckedChange={handleSelectAllDrafted}
              />
              <label
                htmlFor="select-all-drafted"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Select all drafted campaigns
              </label>
            </div>
          )}

          {filteredDraftedCampaigns.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredDraftedCampaigns.map((campaign) => (
                <Card key={campaign.id} className="flex flex-col h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <Checkbox
                          id={`campaign-${campaign.id}`}
                          checked={selectedCampaigns.has(campaign.id)}
                          onCheckedChange={(checked) => handleSelectCampaign(campaign.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base">{campaign.name}</CardTitle>
                        </div>
                      </div>
                      <Badge 
                        variant={getStatusBadgeVariant(campaign.status)}
                        className="shrink-0"
                      >
                        {getStatusDisplayText(campaign.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardFooter className="mt-auto">
                    <Link href={`/campaigns/${campaign.id}`}>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {filteredDraftedCampaigns.length === 0 && !isPending && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {draftedSearchQuery ? 'No drafted campaigns match your search' : 'No drafted campaigns found'}
              </p>
            </div>
          )}
        </div>

        {/* Scheduled Campaigns Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Scheduled Campaigns</h2>
            <div className="w-80">
              <Input
                type="text"
                placeholder="Search scheduled campaigns..."
                value={scheduledSearchQuery}
                onChange={(e) => setScheduledSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
          {filteredScheduledCampaigns.length > 0 && (
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="select-all-scheduled"
                checked={isAllScheduledSelected}
                onCheckedChange={handleSelectAllScheduled}
              />
              <label
                htmlFor="select-all-scheduled"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Select all scheduled campaigns
              </label>
            </div>
          )}

          {filteredScheduledCampaigns.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredScheduledCampaigns.map((campaign) => (
                <Card key={campaign.id} className="flex flex-col h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <Checkbox
                          id={`campaign-${campaign.id}`}
                          checked={selectedCampaigns.has(campaign.id)}
                          onCheckedChange={(checked) => handleSelectCampaign(campaign.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base">{campaign.name}</CardTitle>
                        </div>
                      </div>
                      <Badge 
                        variant={getStatusBadgeVariant(campaign.status)}
                        className="shrink-0"
                      >
                        {getStatusDisplayText(campaign.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardFooter className="mt-auto">
                    <Link href={`/campaigns/${campaign.id}`}>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {filteredScheduledCampaigns.length === 0 && !isPending && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {scheduledSearchQuery ? 'No scheduled campaigns match your search' : 'No scheduled campaigns found'}
              </p>
            </div>
          )}
        </div>
          </>
        )}
      </div>

      {/* Bottom Action Bar */}
      {selectedCampaigns.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">
                  {selectedCampaigns.size} campaign{selectedCampaigns.size !== 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCampaigns(new Set())}
                >
                  Clear selection
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleRevertToDraft}
                  disabled={isActionPending}
                >
                  {isActionPending ? 'Reverting...' : 'Revert to Draft'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelCampaigns}
                  disabled={isActionPending}
                >
                  {isActionPending ? 'Cancelling...' : 'Cancel Campaigns'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
