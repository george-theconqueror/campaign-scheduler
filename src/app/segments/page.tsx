'use client';

import { useState, useTransition, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RefreshCw, Users, Database, Edit, Save, X, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Segment {
  id: string;
  name: string;
}

interface SegmentGroup {
  id: string;
  name: string;
  segmentsToInclude: string[];
  segmentsToExclude: string[];
}

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [segmentGroups, setSegmentGroups] = useState<SegmentGroup[]>([]);
  const [isPending, startTransition] = useTransition();
  const [editingGroup, setEditingGroup] = useState<SegmentGroup | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    segmentsToInclude: [] as string[],
    segmentsToExclude: [] as string[]
  });

  const fetchSegments = async () => {
    try {
      const response = await fetch('/api/segments');
      const data = await response.json();
      
      if (data.success) {
        setSegments(data.data);
      } else {
        toast.error('Failed to fetch segments from Klaviyo');
      }
    } catch (error) {
      console.error('Error fetching segments:', error);
      toast.error('Error fetching segments from Klaviyo');
    }
  };

  const fetchSegmentGroups = async () => {
    try {
      const response = await fetch('/api/segment-groups');
      const data = await response.json();
      
      if (data.success) {
        setSegmentGroups(data.data);
      } else {
        toast.error('Failed to fetch segment groups');
      }
    } catch (error) {
      console.error('Error fetching segment groups:', error);
      toast.error('Error fetching segment groups');
    }
  };

  const fetchAllData = () => {
    startTransition(async () => {
      await Promise.all([fetchSegments(), fetchSegmentGroups()]);
    });
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const getSegmentName = (segmentId: string) => {
    const segment = segments.find(s => s.id === segmentId);
    return segment ? segment.name : `Unknown Segment (${segmentId})`;
  };

  const startEditing = (group: SegmentGroup) => {
    setEditingGroup({ ...group });
  };

  const cancelEditing = () => {
    setEditingGroup(null);
  };

  const addSegmentToInclude = (segmentId: string) => {
    if (!editingGroup) return;
    if (editingGroup.segmentsToInclude.includes(segmentId)) return;
    
    setEditingGroup({
      ...editingGroup,
      segmentsToInclude: [...editingGroup.segmentsToInclude, segmentId],
      segmentsToExclude: editingGroup.segmentsToExclude.filter(id => id !== segmentId)
    });
  };

  const addSegmentToExclude = (segmentId: string) => {
    if (!editingGroup) return;
    if (editingGroup.segmentsToExclude.includes(segmentId)) return;
    
    setEditingGroup({
      ...editingGroup,
      segmentsToExclude: [...editingGroup.segmentsToExclude, segmentId],
      segmentsToInclude: editingGroup.segmentsToInclude.filter(id => id !== segmentId)
    });
  };

  const removeSegmentFromInclude = (segmentId: string) => {
    if (!editingGroup) return;
    setEditingGroup({
      ...editingGroup,
      segmentsToInclude: editingGroup.segmentsToInclude.filter(id => id !== segmentId)
    });
  };

  const removeSegmentFromExclude = (segmentId: string) => {
    if (!editingGroup) return;
    setEditingGroup({
      ...editingGroup,
      segmentsToExclude: editingGroup.segmentsToExclude.filter(id => id !== segmentId)
    });
  };

  const saveSegmentGroup = async () => {
    if (!editingGroup) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/segment-groups/${editingGroup.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingGroup.name,
          segmentsToInclude: editingGroup.segmentsToInclude,
          segmentsToExclude: editingGroup.segmentsToExclude
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the local state
        setSegmentGroups(prev => 
          prev.map(group => 
            group.id === editingGroup.id ? editingGroup : group
          )
        );
        setEditingGroup(null);
        toast.success('Segment group updated successfully');
      } else {
        toast.error(data.message || 'Failed to update segment group');
      }
    } catch (error) {
      console.error('Error saving segment group:', error);
      toast.error('Error saving segment group');
    } finally {
      setIsSaving(false);
    }
  };

  const startCreating = () => {
    setNewGroup({
      name: '',
      segmentsToInclude: [],
      segmentsToExclude: []
    });
    setIsCreating(true);
  };

  const cancelCreating = () => {
    setIsCreating(false);
    setNewGroup({
      name: '',
      segmentsToInclude: [],
      segmentsToExclude: []
    });
  };

  const addSegmentToNewInclude = (segmentId: string) => {
    if (newGroup.segmentsToInclude.includes(segmentId)) return;
    
    setNewGroup({
      ...newGroup,
      segmentsToInclude: [...newGroup.segmentsToInclude, segmentId],
      segmentsToExclude: newGroup.segmentsToExclude.filter(id => id !== segmentId)
    });
  };

  const addSegmentToNewExclude = (segmentId: string) => {
    if (newGroup.segmentsToExclude.includes(segmentId)) return;
    
    setNewGroup({
      ...newGroup,
      segmentsToExclude: [...newGroup.segmentsToExclude, segmentId],
      segmentsToInclude: newGroup.segmentsToInclude.filter(id => id !== segmentId)
    });
  };

  const removeSegmentFromNewInclude = (segmentId: string) => {
    setNewGroup({
      ...newGroup,
      segmentsToInclude: newGroup.segmentsToInclude.filter(id => id !== segmentId)
    });
  };

  const removeSegmentFromNewExclude = (segmentId: string) => {
    setNewGroup({
      ...newGroup,
      segmentsToExclude: newGroup.segmentsToExclude.filter(id => id !== segmentId)
    });
  };

  const createSegmentGroup = async () => {
    if (!newGroup.name.trim()) {
      toast.error('Please enter a name for the segment group');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/segment-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGroup)
      });

      const data = await response.json();
      
      if (data.success) {
        // Add the new group to local state
        setSegmentGroups(prev => [...prev, data.data]);
        setIsCreating(false);
        setNewGroup({
          name: '',
          segmentsToInclude: [],
          segmentsToExclude: []
        });
        toast.success('Segment group created successfully');
      } else {
        toast.error(data.message || 'Failed to create segment group');
      }
    } catch (error) {
      console.error('Error creating segment group:', error);
      toast.error('Error creating segment group');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Segments & Segment Groups
          </h1>
          <p className="text-muted-foreground">
            Manage your Klaviyo segments and segment group configurations
          </p>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={fetchAllData} 
            disabled={isPending}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
            {isPending ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>

        {/* Two Cards Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Klaviyo Segments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Klaviyo Segments
              </CardTitle>
              <CardDescription>
                Segments fetched from your Klaviyo account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPending ? (
                <div className="grid grid-cols-1 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {segments.map((segment) => (
                    <div key={segment.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{segment.name}</span>
                    </div>
                  ))}
                </div>
              )}
              {!isPending && segments.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No segments found
                </div>
              )}
            </CardContent>
          </Card>

          {/* Segment Groups */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Segment Groups
                  </CardTitle>
                  <CardDescription>
                    Configured segment groups for campaign targeting
                  </CardDescription>
                </div>
                <Button
                  onClick={startCreating}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Group
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isPending ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {segmentGroups.map((group) => (
                    <div key={group.id} className="p-4 border rounded-lg">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold">{group.name}</h3>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(group)}
                            className="h-8 px-2"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground mb-1">
                              Include ({group.segmentsToInclude.length})
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {group.segmentsToInclude.map((segmentId) => (
                                <Badge key={segmentId} variant="secondary" className="text-xs">
                                  {getSegmentName(segmentId)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground mb-1">
                              Exclude ({group.segmentsToExclude.length})
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {group.segmentsToExclude.map((segmentId) => (
                                <Badge key={segmentId} variant="outline" className="text-xs">
                                  {getSegmentName(segmentId)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!isPending && segmentGroups.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No segment groups found
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Editor Section */}
        {editingGroup && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    Edit Segment Group: {editingGroup.name}
                  </CardTitle>
                  <CardDescription>
                    Add or remove segments from include/exclude lists
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={cancelEditing}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={saveSegmentGroup}
                    disabled={isSaving}
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Segments to Include */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Segments to Include ({editingGroup.segmentsToInclude.length})
                    </h3>
                    <Select onValueChange={addSegmentToInclude}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Add segment" />
                      </SelectTrigger>
                      <SelectContent>
                        {segments
                          .filter(segment => !editingGroup.segmentsToInclude.includes(segment.id))
                          .map((segment) => (
                            <SelectItem key={segment.id} value={segment.id}>
                              {segment.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {editingGroup.segmentsToInclude.map((segmentId) => (
                      <div key={segmentId} className="flex items-center justify-between p-2 bg-muted rounded border">
                        <span className="text-sm">{getSegmentName(segmentId)}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeSegmentFromInclude(segmentId)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {editingGroup.segmentsToInclude.length === 0 && (
                      <div className="text-center text-muted-foreground py-4">
                        No segments included
                      </div>
                    )}
                  </div>
                </div>

                {/* Segments to Exclude */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Segments to Exclude ({editingGroup.segmentsToExclude.length})
                    </h3>
                    <Select onValueChange={addSegmentToExclude}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Add segment" />
                      </SelectTrigger>
                      <SelectContent>
                        {segments
                          .filter(segment => !editingGroup.segmentsToExclude.includes(segment.id))
                          .map((segment) => (
                            <SelectItem key={segment.id} value={segment.id}>
                              {segment.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {editingGroup.segmentsToExclude.map((segmentId) => (
                      <div key={segmentId} className="flex items-center justify-between p-2 bg-muted rounded border">
                        <span className="text-sm">{getSegmentName(segmentId)}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeSegmentFromExclude(segmentId)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {editingGroup.segmentsToExclude.length === 0 && (
                      <div className="text-center text-muted-foreground py-4">
                        No segments excluded
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* New Segment Group Creator */}
        {isCreating && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create New Segment Group
                  </CardTitle>
                  <CardDescription>
                    Add a new segment group for campaign targeting
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={cancelCreating}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={createSegmentGroup}
                    disabled={isSaving}
                    size="sm"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {isSaving ? 'Creating...' : 'Create Group'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Group Name Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Group Name</label>
                  <Input
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    placeholder="Enter segment group name"
                    className="max-w-md"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Segments to Include */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        Segments to Include ({newGroup.segmentsToInclude.length})
                      </h3>
                      <Select onValueChange={addSegmentToNewInclude}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Add segment" />
                        </SelectTrigger>
                        <SelectContent>
                          {segments
                            .filter(segment => !newGroup.segmentsToInclude.includes(segment.id))
                            .map((segment) => (
                              <SelectItem key={segment.id} value={segment.id}>
                                {segment.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {newGroup.segmentsToInclude.map((segmentId) => (
                        <div key={segmentId} className="flex items-center justify-between p-2 bg-muted rounded border">
                          <span className="text-sm">{getSegmentName(segmentId)}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeSegmentFromNewInclude(segmentId)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {newGroup.segmentsToInclude.length === 0 && (
                        <div className="text-center text-muted-foreground py-4">
                          No segments included
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Segments to Exclude */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        Segments to Exclude ({newGroup.segmentsToExclude.length})
                      </h3>
                      <Select onValueChange={addSegmentToNewExclude}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Add segment" />
                        </SelectTrigger>
                        <SelectContent>
                          {segments
                            .filter(segment => !newGroup.segmentsToExclude.includes(segment.id))
                            .map((segment) => (
                              <SelectItem key={segment.id} value={segment.id}>
                                {segment.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {newGroup.segmentsToExclude.map((segmentId) => (
                        <div key={segmentId} className="flex items-center justify-between p-2 bg-muted rounded border">
                          <span className="text-sm">{getSegmentName(segmentId)}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeSegmentFromNewExclude(segmentId)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {newGroup.segmentsToExclude.length === 0 && (
                        <div className="text-center text-muted-foreground py-4">
                          No segments excluded
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
