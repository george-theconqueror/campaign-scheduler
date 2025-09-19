import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, List, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Campaign Scheduler
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage and schedule your Klaviyo email campaigns with precision. 
            Create, organize, and schedule campaigns with advanced timing strategies.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* View Campaigns Card */}
          <Card className="group hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg">
                  <List className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">View Campaigns</CardTitle>
                  <CardDescription>
                    Browse and manage all your email campaigns
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View all your drafted and scheduled campaigns. Manage campaign status, 
                revert to draft, or cancel campaigns as needed.
              </p>
              <Link href="/campaigns">
                <Button className="w-full group-hover:bg-primary/90 transition-colors">
                  View Campaigns
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Schedule Campaigns Card */}
          <Card className="group hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Schedule Campaigns</CardTitle>
                  <CardDescription>
                    Schedule campaigns with advanced timing strategies
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Schedule your draft campaigns with static timing, throttled delivery, 
                or smart send time optimization for maximum engagement.
              </p>
              <Link href="/schedule-campaigns">
                <Button className="w-full group-hover:bg-primary/90 transition-colors">
                  Schedule Campaigns
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
