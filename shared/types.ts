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
}
// Zod Schemas for Validation
export const CreateCampaignSchema = z.object({
  name: z.string().min(3, { message: "Campaign name must be at least 3 characters long." }),
  callListId: z.string().min(1, { message: "Please select a call list." }),
});
export type CreateCampaignData = z.infer<typeof CreateCampaignSchema>;
export const EditCampaignSchema = CreateCampaignSchema;
export type EditCampaignData = z.infer<typeof EditCampaignSchema>;
export const UpdateCampaignStatusSchema = z.object({
    status: CampaignStatusSchema,
});
export type UpdateCampaignStatusData = z.infer<typeof UpdateCampaignStatusSchema>;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['text/csv'];
export const CreateCallListSchema = z.object({
  name: z.string().min(3, { message: "List name must be at least 3 characters long." }),
  file: z.instanceof(File, { message: 'A CSV file is required.' })
    .refine((file) => file.size > 0, 'A CSV file is required.')
    .refine((file) => file.size <= MAX_FILE_SIZE, `File size should be less than 5MB.`)
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      'Only .csv files are accepted.'
    ),
});
export type CreateCallListData = z.infer<typeof CreateCallListSchema>;
export const SettingsSchema = z.object({
  serverAddress: z.string().min(1, "Server address is required."),
  dbHost: z.string().min(1, "Database host is required."),
  dbPort: z.coerce.number().min(1, "Port must be a positive number."),
  dbUsername: z.string().min(1, "Username is required."),
  dbPassword: z.string(),
  timezone: z.string(),
  emailNotifications: z.boolean(),
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