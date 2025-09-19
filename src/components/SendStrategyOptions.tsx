'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { CampaignRequest } from '@/types/CampaignRequest';
export type SendStrategy = 'static' | 'throttled' | 'smart_send_time' | 'immediate';

interface SendStrategyOptionsProps {
  currentCampaign: CampaignRequest;
  currentCampaignName: string;
  updateStrategy: (campaignId: string, key: string, value: any) => void;
  resetStrategy: (campaignId: string, method: string) => void;
  
  className?: string;
}

export default function SendStrategyOptions({ 
  currentCampaign,
  currentCampaignName="",
  updateStrategy,
  resetStrategy,
}: SendStrategyOptionsProps) {





  const renderStrategyContent = () => {
    switch (currentCampaign.send_strategy.method) {
      case 'static':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="static-date">Send Date</Label>
              <Input
                id="static-date"
                type="datetime-local"
                placeholder="Select date and time"
                value={currentCampaign.send_strategy.datetime || ''}
                onChange={(e) => updateStrategy(currentCampaign.campaignId, 'datetime', e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-local"
                checked={currentCampaign.send_strategy.options?.is_local || false}
                onCheckedChange={(checked) => updateStrategy(currentCampaign.campaignId, 'options', { ...currentCampaign.send_strategy.options, is_local: checked })}              />
              <Label htmlFor="is-local" className="text-sm font-normal">
                Use recipient&apos;s local timezone
              </Label>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Campaign will be sent at the specified date and time.</p>
            </div>
          </div>
        );

      case 'throttled':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="throttle-datetime">Send Date</Label>
              <Input
                id="throttle-datetime"
                type="datetime-local"
                placeholder="Select date and time"
                value={currentCampaign.send_strategy.datetime || ''}
                onChange={(e) => updateStrategy(currentCampaign.campaignId,'datetime', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="throttle-percentage">Throttle Percentage</Label>
              <Select
                value={currentCampaign.send_strategy.throttle_percentage?.toString() || ''}
                onValueChange={(value) => {
                  if (value && value !== '') {
                    updateStrategy(currentCampaign.campaignId,'throttle_percentage', parseInt(value, 10));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select throttle percentage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="11">11%</SelectItem>
                  <SelectItem value="13">13%</SelectItem>
                  <SelectItem value="14">14%</SelectItem>
                  <SelectItem value="17">17%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                  <SelectItem value="25">25%</SelectItem>
                  <SelectItem value="33">33%</SelectItem>
                  <SelectItem value="50">50%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Campaign will be sent gradually at the specified percentage rate.</p>
            </div>
          </div>
        );


      default:
        return null;
    }
  };



  return (
    <Card >
      <CardHeader>
        <CardTitle>{currentCampaignName !== "" ? currentCampaignName : "No Campaign Selected"}</CardTitle>
        {currentCampaignName ==="" && <p>Select a campaign for scheduling</p>}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="strategy-select">Strategy Type</Label>
          <Select value={currentCampaign.send_strategy.method} onValueChange={(value) => resetStrategy(currentCampaign.campaignId, value)}>
            <SelectTrigger id="strategy-select">
              <SelectValue placeholder="Select send strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="static">Static</SelectItem>
              <SelectItem value="throttled">Gradual</SelectItem>
              <SelectItem value="immediate">Send Now</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {renderStrategyContent()}

        <div className="flex items-center space-x-2">
          <Switch
            id="use-smart-sending"
            checked={currentCampaign.send_options?.use_smart_sending || false}
            onCheckedChange={(checked) => updateStrategy(currentCampaign.campaignId, 'use_smart_sending', checked)}
          />
          <Label htmlFor="use-smart-sending" className="text-sm font-normal">
            Use Smart Sending
          </Label>
        </div>
        
      </CardContent>
    </Card>
  );
}
