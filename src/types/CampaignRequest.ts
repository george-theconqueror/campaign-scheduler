export interface CampaignRequest {
  campaignId: string;
  send_strategy: {
    date?: string;
    method: string;
    datetime?: string | null;
    throttle_percentage?: number | null;
    options?: Record<string, any>; 
  };
  send_options: {
    use_smart_sending: boolean;
  };
}
