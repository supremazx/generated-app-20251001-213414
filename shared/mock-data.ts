import type { Campaign, Agent, CallList, DialerStats, BillingInfo, UserDashboardInfo } from './types';
export const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 'c-001', name: 'Q4 Sales Push', status: 'Active', callListId: 'cl-101', totalLeads: 5000, dialedLeads: 1250, connections: 312, createdAt: '2023-10-01T10:00:00Z' },
  { id: 'c-002', name: 'New Product Launch', status: 'Active', callListId: 'cl-102', totalLeads: 10000, dialedLeads: 8500, connections: 1500, createdAt: '2023-10-05T14:30:00Z' },
  { id: 'c-003', name: 'Customer Feedback Follow-up', status: 'Paused', callListId: 'cl-103', totalLeads: 2500, dialedLeads: 1000, connections: 450, createdAt: '2023-09-20T09:00:00Z' },
  { id: 'c-004', name: 'Lead Nurturing Campaign', status: 'Completed', callListId: 'cl-104', totalLeads: 7500, dialedLeads: 7500, connections: 2100, createdAt: '2023-08-15T11:00:00Z' },
  { id: 'c-005', name: 'Website Demo Signups', status: 'Draft', callListId: 'cl-105', totalLeads: 1500, dialedLeads: 0, connections: 0, createdAt: '2023-10-10T16:00:00Z' },
];
export const MOCK_AGENTS: Agent[] = [
  { id: 'a-101', name: 'Alice Johnson', extension: '1001', status: 'On Call', currentCallDuration: 125, avatarUrl: 'https://i.pravatar.cc/150?u=a-101' },
  { id: 'a-102', name: 'Bob Williams', extension: '1002', status: 'Waiting', currentCallDuration: 0, avatarUrl: 'https://i.pravatar.cc/150?u=a-102' },
  { id: 'a-103', name: 'Charlie Brown', extension: '1003', status: 'Paused', currentCallDuration: 0, avatarUrl: 'https://i.pravatar.cc/150?u=a-103' },
  { id: 'a-104', name: 'Diana Miller', extension: '1004', status: 'On Call', currentCallDuration: 45, avatarUrl: 'https://i.pravatar.cc/150?u=a-104' },
  { id: 'a-105', name: 'Ethan Davis', extension: '1005', status: 'Waiting', currentCallDuration: 0, avatarUrl: 'https://i.pravatar.cc/150?u=a-105' },
  { id: 'a-106', name: 'Fiona Garcia', extension: '1006', status: 'Offline', currentCallDuration: 0, avatarUrl: 'https://i.pravatar.cc/150?u=a-106' },
  { id: 'a-107', name: 'George Rodriguez', extension: '1007', status: 'Waiting', currentCallDuration: 0, avatarUrl: 'https://i.pravatar.cc/150?u=a-107' },
  { id: 'a-108', name: 'Hannah Wilson', extension: '1008', status: 'Paused', currentCallDuration: 0, avatarUrl: 'https://i.pravatar.cc/150?u=a-108' },
];
export const MOCK_CALL_LISTS: CallList[] = [
    { id: 'cl-101', name: 'US West Leads', totalLeads: 5000, dialedLeads: 1250, uploadedAt: '2023-09-30T12:00:00Z' },
    { id: 'cl-102', name: 'EMEA Enterprise', totalLeads: 10000, dialedLeads: 8500, uploadedAt: '2023-10-04T18:00:00Z' },
    { id: 'cl-103', name: 'APAC SMB Contacts', totalLeads: 2500, dialedLeads: 1000, uploadedAt: '2023-09-19T10:00:00Z' },
    { id: 'cl-104', name: 'LATAM Prospects', totalLeads: 7500, dialedLeads: 7500, uploadedAt: '2023-08-14T15:00:00Z' },
    { id: 'cl-105', name: 'New Signups Q4', totalLeads: 1500, dialedLeads: 0, uploadedAt: '2023-10-10T14:00:00Z' },
];
export const MOCK_DIALER_STATS: DialerStats = {
  callsMade: 28753,
  connectionRate: 28.5,
  activeAgents: 5,
  liveCampaigns: 2,
  callsOverTime: [
    { name: '9am', calls: 400 },
    { name: '10am', calls: 620 },
    { name: '11am', calls: 800 },
    { name: '12pm', calls: 750 },
    { name: '1pm', calls: 980 },
    { name: '2pm', calls: 1300 },
    { name: '3pm', calls: 1100 },
    { name: '4pm', calls: 1500 },
  ],
  campaignProgress: MOCK_CAMPAIGNS.filter(c => c.status === 'Active').map(c => ({
    name: c.name,
    dialed: c.dialedLeads,
    total: c.totalLeads,
  })),
};
const aiServiceCost = 0.025;
const sipCost = 0.015;
const totalBaseCost = aiServiceCost + sipCost;
const price = 0.050;
const profit = price - totalBaseCost;
const usage = 4325;
export const MOCK_BILLING_INFO: BillingInfo = {
  currentUsageMinutes: usage,
  cycleEndDate: 'October 31, 2023',
  history: [
    { id: 'INV-0923', date: 'September 1, 2023', amount: 115.50, status: 'Paid' },
    { id: 'INV-0823', date: 'August 1, 2023', amount: 98.00, status: 'Paid' },
    { id: 'INV-0723', date: 'July 1, 2023', amount: 132.25, status: 'Paid' },
  ],
  pricePerMinute: price,
  aiServiceCostPerMinute: aiServiceCost,
  sipCostPerMinute: sipCost,
  totalBaseCostPerMinute: totalBaseCost,
  profitPerMinute: profit,
  totalProfit: profit * usage,
  costUsdPerMs: totalBaseCost / 60000,
};
const totalAiMinutesUsed = 12450;
export const MOCK_USER_DASHBOARD_INFO: UserDashboardInfo = {
  userName: 'John Doe',
  userEmail: 'john.doe@example.com',
  accountBalance: 1250.75,
  totalAiMinutesUsed: totalAiMinutesUsed,
  totalCallsMade: 8320,
  averageCallDuration: 145, // in seconds
  aiCostThisCycle: totalAiMinutesUsed * totalBaseCost,
};