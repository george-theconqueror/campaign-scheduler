'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Campaign } from '@/types/Campaign';

interface CampaignsSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  campaigns?: Campaign[];
}

export function CampaignsSelect({ value, onChange, placeholder = "Select campaign...", campaigns = [] }: CampaignsSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="border-0 p-1 h-auto focus-visible:ring-0 w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {campaigns.length === 0 ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            No campaigns available
          </div>
        ) : (
          campaigns.map((campaign) => (
            <SelectItem key={campaign.id} value={campaign.id}>
              <div className="flex flex-col">
                <span className="font-medium">{campaign.name}</span>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
