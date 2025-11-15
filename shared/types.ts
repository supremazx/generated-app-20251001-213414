import { z } from 'zod';
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export const CampaignStatusSchema = z.enum(['Active', 'Paused', 'Completed', 'Draft']);
export type CampaignStatus = z.infer<typeof CampaignStatusSchema>;
export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  callListId: string;
  agentId?: string;
  knowledgeBaseId?: string;
  audioFileId?: string;
  totalLeads: number;
  dialedLeads: number;
  connections: number;
  createdAt: string;
}
export type AgentStatus = 'Waiting' | 'On Call' | 'Paused' | 'Offline';
export interface Agent {
  id: string;
  name: string;
  extension: string;
  status: AgentStatus;
  currentCallDuration: number; // in seconds
  avatarUrl: string;
}
export interface CallList {
  id: string;
  name: string;
  totalLeads: number;
  dialedLeads: number;
  uploadedAt: string;
}
export interface KnowledgeBase {
  id: string;
  name: string;
  uploadedAt: string;
  leadCount: number;
}
export interface AudioFile {
  id: string;
  name: string;
  fileName: string;
  size: number; // in bytes
  uploadedAt: string;
}
export type CallLogStatus = 'Dialing' | 'Answered' | 'Busy' | 'Failed';
export interface CallLog {
  id: string;
  campaignId: string;
  phoneNumber: string;
  status: CallLogStatus;
  duration: number; // in seconds
  timestamp: string;
}
export interface DialerStats {
  callsMade: number;
  connectionRate: number;
  activeAgents: number;
  liveCampaigns: number;
  callsOverTime: { name: string; calls: number }[];
  campaignProgress: { name: string; dialed: number; total: number }[];
}
export interface BillingHistoryItem {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Due';
}
export interface BillingInfo {
  currentUsageMinutes: number;
  cycleEndDate: string;
  history: BillingHistoryItem[];
  pricePerMinute: number;
  aiServiceCostPerMinute: number;
  sipCostPerMinute: number;
  totalBaseCostPerMinute: number;
  profitPerMinute: number;
  totalProfit: number;
  costUsdPerMs: number;
}
export interface UserDashboardInfo {
  userName: string;
  userEmail: string;
  accountBalance: number;
  totalAiMinutesUsed: number;
  totalCallsMade: number;
  averageCallDuration: number; // in seconds
  aiCostThisCycle: number;
  userCampaignProgress: { name: string; dialed: number; total: number }[];
  userCallsOverTime: { name: string; calls: number }[];
}
// Zod Schemas for Validation
export const CreateCampaignSchema = z.object({
  name: z.string().min(3, { message: "Campaign name must be at least 3 characters long." }),
  callListId: z.string().min(1, { message: "Please select a call list." }),
  agentId: z.string().optional(),
  knowledgeBaseId: z.string().optional(),
  audioFileId: z.string().optional(),
});
export type CreateCampaignData = z.infer<typeof CreateCampaignSchema>;
export const EditCampaignSchema = z.object({
  name: z.string().min(3, { message: "Campaign name must be at least 3 characters long." }),
  callListId: z.string().min(1, { message: "Please select a call list." }),
  agentId: z.string().optional(),
  knowledgeBaseId: z.string().optional(),
  audioFileId: z.string().optional(),
});
export type EditCampaignData = z.infer<typeof EditCampaignSchema>;
export const UpdateCampaignStatusSchema = z.object({
    status: CampaignStatusSchema,
});
export type UpdateCampaignStatusData = z.infer<typeof UpdateCampaignStatusSchema>;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_CALL_LIST_TYPES = ['text/csv'];
export const CreateCallListSchema = z.object({
  name: z.string().min(3, { message: "List name must be be at least 3 characters long." }),
  file: z.instanceof(File, { message: 'A CSV file is required.' })
    .refine((file) => file.size > 0, 'A CSV file is required.')
    .refine((file) => file.size <= MAX_FILE_SIZE, `File size should be less than 5MB.`)
    .refine(
      (file) => ACCEPTED_CALL_LIST_TYPES.includes(file.type),
      'Only .csv files are accepted.'
    ),
});
export type CreateCallListData = z.infer<typeof CreateCallListSchema>;
const ACCEPTED_KB_FILE_TYPES = [
  'text/csv',
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];
export const CreateKnowledgeBaseSchema = z.object({
  name: z.string().min(3, { message: "Knowledge base name must be at least 3 characters long." }),
  file: z.instanceof(File, { message: 'A file is required.' })
    .refine((file) => file.size > 0, 'A file is required.')
    .refine((file) => file.size <= MAX_FILE_SIZE, `File size should be less than 5MB.`)
    .refine(
      (file) => ACCEPTED_KB_FILE_TYPES.includes(file.type),
      'Only .csv, .pdf, .xls, .xlsx, and .txt files are accepted.'
    ),
});
export type CreateKnowledgeBaseData = z.infer<typeof CreateKnowledgeBaseSchema>;
const ACCEPTED_AUDIO_FILE_TYPES = ['audio/mpeg', 'audio/wav'];
export const CreateAudioFileSchema = z.object({
  name: z.string().min(3, { message: "Audio file name must be at least 3 characters long." }),
  file: z.instanceof(File, { message: 'An audio file is required.' })
    .refine((file) => file.size > 0, 'An audio file is required.')
    .refine((file) => file.size <= MAX_FILE_SIZE, `File size should be less than 5MB.`)
    .refine(
      (file) => ACCEPTED_AUDIO_FILE_TYPES.includes(file.type),
      'Only .mp3 and .wav files are accepted.'
    ),
});
export type CreateAudioFileData = z.infer<typeof CreateAudioFileSchema>;
export const SettingsSchema = z.object({
  serverAddress: z.string().min(1, "Server address is required."),
  dbHost: z.string().min(1, "Database host is required."),
  dbPort: z.coerce.number().min(1, "Port must be a positive number."),
  dbUsername: z.string().min(1, "Username is required."),
  dbPassword: z.string(),
  timezone: z.string(),
  emailNotifications: z.boolean(),
  pricePerMinute: z.coerce.number().min(0, "Price must be a positive number."),
  aiBasePricePerMinute: z.coerce.number().min(0, "Price must be a positive number."),
  aiAgentSipMinuteCost: z.coerce.number().min(0, "Cost must be a positive number."),
  sippulseApiKey: z.string().optional(),
});
export type Settings = z.infer<typeof SettingsSchema>;
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters long." }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;
// Reseller Panel Types
export const ClientStatusSchema = z.enum(['Active', 'Suspended']);
export type ClientStatus = z.infer<typeof ClientStatusSchema>;
export interface ResellerClient {
  id: string;
  companyName: string;
  contactEmail: string;
  status: ClientStatus;
  agentId: string;
  createdAt: string;
}
export interface ResellerDashboardStats {
  totalClients: number;
  activeClients: number;
  monthlyRecurringRevenue: number;
  totalProvisionedAgents: number;
  clientGrowth: { month: string; count: number }[];
  revenueOverTime: { month: string; revenue: number }[];
}
export const CreateResellerClientSchema = z.object({
  companyName: z.string().min(2, "Company name is required."),
  contactEmail: z.string().email("Invalid email address."),
  agentId: z.string().min(1, "Bir agent seçmek zorunludur."),
});
export type CreateResellerClientData = z.infer<typeof CreateResellerClientSchema>;
export const EditResellerClientSchema = CreateResellerClientSchema;
export type EditResellerClientData = z.infer<typeof EditResellerClientSchema>;
export const UpdateClientStatusSchema = z.object({
    status: ClientStatusSchema,
});
export type UpdateClientStatusData = z.infer<typeof UpdateClientStatusSchema>;
export interface ResellerInvoice {
  id: string;
  clientName: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Due' | 'Overdue';
}
export interface ResellerBillingInfo {
  totalRevenue: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  invoices: ResellerInvoice[];
}