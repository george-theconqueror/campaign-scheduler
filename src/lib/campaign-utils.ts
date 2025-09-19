import { CampaignRequest } from '@/types/CampaignRequest';

/**
 * Checks if a campaign strategy is complete based on the method type
 */
export const isCampaignStrategyComplete = (strategy: CampaignRequest['send_strategy']): boolean => {
  if (!strategy.method) return false;

  switch (strategy.method) {
    case 'static':
      return !!(strategy.datetime && strategy.options?.is_local !== undefined);
    
    case 'throttled':
      return !!(strategy.datetime && strategy.throttle_percentage);
    
    case 'smart_send_time':
      return !!(strategy.options?.timezone && strategy.options?.sendWindowStart && strategy.options?.sendWindowEnd && strategy.datetime);
    
    default:
      return false;
  }
};

/**
 * Creates a default strategy object based on the method
 */
export const createDefaultStrategy = (method: string = 'static'): CampaignRequest['send_strategy'] => {
  return {
    method,
    datetime: null,
    throttle_percentage: method === 'throttled' ? null : undefined,
    options: method === 'smart_send_time' ? {} : undefined
  };
};

/**
 * Processes campaign requests for API submission
 */
export const processCampaignRequests = (campaignRequests: CampaignRequest[]) => {
  return campaignRequests.map(req => ({
    campaignId: req.campaignId,
    send_strategy: {
      ...req.send_strategy,
      datetime: req.send_strategy.datetime ? new Date(req.send_strategy.datetime).toISOString() : null,
      throttle_percentage: req.send_strategy.throttle_percentage ? parseInt(req.send_strategy.throttle_percentage.toString(), 10) : null,
    }
  }));
};

/**
 * Validates that all campaign strategies are complete
 */
export const validateCampaignRequests = (campaignRequests: CampaignRequest[]): {
  isValid: boolean;
  incompleteCount: number;
  incompleteCampaigns: CampaignRequest[];
} => {
  const incompleteCampaigns = campaignRequests.filter(req => !isCampaignStrategyComplete(req.send_strategy));
  
  return {
    isValid: incompleteCampaigns.length === 0,
    incompleteCount: incompleteCampaigns.length,
    incompleteCampaigns
  };
};
