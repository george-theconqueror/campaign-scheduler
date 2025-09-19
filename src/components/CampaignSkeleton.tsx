import { Card, CardHeader, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CampaignSkeleton() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Skeleton className="h-4 w-4 mt-1 rounded" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-5 w-3/4" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full shrink-0" />
        </div>
      </CardHeader>
      <CardFooter className="mt-auto">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

export function CampaignsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Drafted Campaigns Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-80" />
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <CampaignSkeleton key={index} />
          ))}
        </div>
      </div>

      {/* Scheduled Campaigns Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-10 w-80" />
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-56" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <CampaignSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
