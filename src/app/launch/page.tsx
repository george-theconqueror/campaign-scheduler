'use client';

import { useContext, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Settings } from 'lucide-react';
import { CampaignsSelect } from '@/components/CampaignsSelect';
import { toast } from 'sonner';
import { CampaignsContext, SegmentGroup } from '@/context/CampaignsContext';
import Link from 'next/link';

export default function LaunchPage() {
  const context = useContext(CampaignsContext);
  const [segmentGroups, setSegmentGroups] = useState<SegmentGroup[]>([]);
  
  if (!context) {
    throw new Error('LaunchPage must be used within CampaignsProvider');
  }
  
  const {
    tableData,
    launchName,
    setLaunchName,
    campaigns,
    setCampaigns,
    addRow,
    removeRow,
    updateCell,
    updateExcludedSegments
  } = context;

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns/sent');
        const data = await response.json();
        
        if (data.success) {
          setCampaigns(data.data);
        } else {
          console.error('Failed to fetch campaigns:', data.message);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };

    const fetchSegmentGroups = async () => {
      try {
        const response = await fetch('/api/segment-groups');
        const data = await response.json();
        
        if (data.success) {
          setSegmentGroups(data.data);
        } else {
          console.error('Failed to fetch segment groups:', data.message);
        }
      } catch (error) {
        console.error('Error fetching segment groups:', error);
      }
    };

    fetchCampaigns();
    fetchSegmentGroups();
  }, [setCampaigns]);

  const createCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns/create-launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          launchName,
          configurations: tableData,
          
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Successfully created ${result.successfulCampaigns} campaigns!`);
        console.log('Campaigns created:', result);
      } else {
        toast.error(`Error: ${result.message || 'Failed to create campaigns'}`);
        console.error('Error creating campaigns:', result);
      }
    } catch (error) {
      toast.error('Error creating campaigns. Please try again.');
      console.error('Error creating campaigns:', error);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Campaign Launch Configuration
          </h1>
          <p className="text-muted-foreground">
            Configure your campaign launch parameters by editing the table below
          </p>
          <div className="flex justify-center">
            <Link href="/segments">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Manage Segments
              </Button>
            </Link>
          </div>
        </div>

       

        <Card>
          <CardHeader>
            <CardTitle>Launch Name</CardTitle>
            <CardDescription>
              Enter a name for this campaign launch configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={launchName}
              onChange={(e) => setLaunchName(e.target.value)}
              placeholder="Enter launch name..."
              className="max-w-md"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Launch Configuration Table</CardTitle>
                <CardDescription>
                  Edit the cells directly to configure your campaign launch parameters
                </CardDescription>
              </div>
              <Button onClick={addRow} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Row
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">User Type</TableHead>
                    <TableHead className="w-[200px]">Audience</TableHead>
                    <TableHead className="w-[200px]">Territory</TableHead>
                    <TableHead className="w-[200px]">Test</TableHead>
                    <TableHead className="w-[250px]">Campaign to Clone</TableHead>
                    <TableHead className="w-[250px]">Audience Segments</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Input
                          value={row.userType}
                          onChange={(e) => updateCell(row.id, 'userType', e.target.value)}
                          placeholder=""
                          className="border-0 p-2 h-auto focus-visible:ring-0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.audience}
                          onChange={(e) => updateCell(row.id, 'audience', e.target.value)}
                          placeholder=""
                          className="border-0 p-2 h-auto focus-visible:ring-0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.territory}
                          onChange={(e) => updateCell(row.id, 'territory', e.target.value)}
                          placeholder=""
                          className="border-0 p-2 h-auto focus-visible:ring-0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.test}
                          onChange={(e) => updateCell(row.id, 'test', e.target.value)}
                          placeholder=""
                          className="border-0 p-2 h-auto focus-visible:ring-0"
                        />
                      </TableCell>
                      <TableCell>
                        <CampaignsSelect
                          value={row.campaignToClone}
                          onChange={(value) => updateCell(row.id, 'campaignToClone', value)}
                          placeholder="Select campaign to clone"
                          campaigns={campaigns}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={row.excludedSegments?.name || ""}
                          onValueChange={(value) => updateExcludedSegments(row.id, value, segmentGroups)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select segment group" />
                          </SelectTrigger>
                          <SelectContent>
                            {segmentGroups.map((group) => (
                              <SelectItem key={group.id} value={group.name}>
                                {group.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRow(row.id)}
                          className="h-8 w-8  text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Create campaigns based on your configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={createCampaigns}
              className="w-full sm:w-auto"
              disabled={!launchName.trim() || tableData.length === 0}
            >
              Create Campaigns
            </Button>
            {!launchName.trim() && (
              <p className="text-sm text-muted-foreground mt-2">
                Please enter a launch name to create campaigns
              </p>
            )}
            {launchName.trim() && tableData.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Please add at least one configuration row
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Data (Debug)</CardTitle>
            <CardDescription>
              This shows the current state of your launch configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
              {JSON.stringify({ launchName, tableData }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
