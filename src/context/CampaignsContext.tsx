'use client';

import { createContext, useState, ReactNode } from 'react';
import { Campaign } from '@/types/Campaign';
import { Segment } from '@/types/Segment';

export interface SegmentGroup {
  id: string;
  name: string;
  segmentsToInclude: Segment[];
  segmentsToExclude: Segment[];
}

export interface TableRowData {
  id: number;
  campaignToClone: string;
  userType: string;
  audience: string;
  territory: string;
  test: string;
  excludedSegments: SegmentGroup | null;
}

interface CampaignsContextType {
  // Table data state
  tableData: TableRowData[];
  setTableData: React.Dispatch<React.SetStateAction<TableRowData[]>>;
  nextId: number;
  setNextId: React.Dispatch<React.SetStateAction<number>>;
  
  // Launch name state
  launchName: string;
  setLaunchName: React.Dispatch<React.SetStateAction<string>>;
  
  // Campaigns data state
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  
  // Segment group state
  groupSegment: SegmentGroup | null;
  setGroupSegment: React.Dispatch<React.SetStateAction<SegmentGroup | null>>;
  
  // Table manipulation functions
  updateCell: (id: number, field: keyof Omit<TableRowData, 'id'>, value: string | SegmentGroup) => void;
  addRow: () => void;
  removeRow: (id: number) => void;
  
  // Segment group functions
  updateExcludedSegments: (id: number, segmentGroupName: string, segmentGroups: SegmentGroup[]) => void;
}

export const CampaignsContext = createContext<CampaignsContextType | undefined>(undefined);

interface CampaignsProviderProps {
  children: ReactNode;
}

export function CampaignsProvider({ children }: CampaignsProviderProps) {
  const [tableData, setTableData] = useState<TableRowData[]>([]);
  const [nextId, setNextId] = useState(1);
  const [launchName, setLaunchName] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [groupSegment, setGroupSegment] = useState<SegmentGroup | null>(null);

  const updateCell = (id: number, field: keyof Omit<TableRowData, 'id'>, value: string | SegmentGroup) => {
    setTableData(prevData =>
      prevData.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const addRow = () => {
    const newRow: TableRowData = {
      id: nextId,
      campaignToClone: '',
      userType: '',
      audience: '',
      territory: '',
      test: '',
      excludedSegments: null
    };
    setTableData(prevData => [...prevData, newRow]);
    setNextId(prevId => prevId + 1);
  };

  

  const updateExcludedSegments = (id: number, segmentGroupName: string, segmentGroups: SegmentGroup[]) => {
    const selectedGroup: SegmentGroup = segmentGroups.find(group => group.name === segmentGroupName)!;
    if (selectedGroup) {
      updateCell(id, 'excludedSegments', selectedGroup);
    }
  };

  const removeRow = (id: number) => {
    setTableData(prevData => prevData.filter(row => row.id !== id));
  };

  const value: CampaignsContextType = {
    tableData,
    setTableData,
    nextId,
    setNextId,
    launchName,
    setLaunchName,
    campaigns,
    setCampaigns,
    groupSegment,
    setGroupSegment,
    updateCell,
    addRow,
    removeRow,
    updateExcludedSegments,
  };

  return (
    <CampaignsContext.Provider value={value}>
      {children}
    </CampaignsContext.Provider>
  );
}
