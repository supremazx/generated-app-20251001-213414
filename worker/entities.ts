import { IndexedEntity, Entity, type Env } from "./core-utils";
import type { Campaign, Agent, CallList, DialerStats, Settings, BillingInfo, UserDashboardInfo, ChangePasswordData } from "@shared/types";
import { MOCK_CAMPAIGNS, MOCK_AGENTS, MOCK_CALL_LISTS, MOCK_DIALER_STATS, MOCK_BILLING_INFO, MOCK_USER_DASHBOARD_INFO } from "@shared/mock-data";
export class CampaignEntity extends IndexedEntity<Campaign> {
  static readonly entityName = "campaign";
  static readonly indexName = "campaigns";
  static readonly initialState: Campaign = { id: "", name: "", status: 'Draft', callListId: '', totalLeads: 0, dialedLeads: 0, connections: 0, createdAt: '' };
  static seedData = MOCK_CAMPAIGNS;
}
export class AgentEntity extends IndexedEntity<Agent> {
  static readonly entityName = "agent";
  static readonly indexName = "agents";
  static readonly initialState: Agent = { id: "", name: "", extension: "", status: 'Offline', currentCallDuration: 0, avatarUrl: '' };
  static seedData = MOCK_AGENTS;
}
export class CallListEntity extends IndexedEntity<CallList> {
    static readonly entityName = "callList";
    static readonly indexName = "callLists";
    static readonly initialState: CallList = { id: "", name: "", totalLeads: 0, dialedLeads: 0, uploadedAt: "" };
    static seedData = MOCK_CALL_LISTS;
}
export class SettingsEntity extends Entity<Settings> {
    static readonly entityName = "settings";
    static readonly initialState: Settings = {
        serverAddress: '',
        dbHost: '',
        dbPort: 5432,
        dbUsername: '',
        dbPassword: '',
        timezone: 'est',
        emailNotifications: false,
        aiBasePricePerMinute: 0.025,
        aiAgentSipMinuteCost: 0.015,
        sippulseApiKey: '',
    };
    constructor(env: Env) {
        super(env, 'global-settings'); // Use a fixed ID for the singleton settings object
    }
}
export class DialerStatsService {
    static async getStats(env: Env): Promise<DialerStats> {
        const campaigns = (await CampaignEntity.list(env)).items;
        const agents = (await AgentEntity.list(env)).items;
        const activeCampaigns = campaigns.filter(c => c.status === 'Active');
        const totalCallsMade = campaigns.reduce((sum, c) => sum + c.dialedLeads, 0);
        const totalConnections = campaigns.reduce((sum, c) => sum + c.connections, 0);
        return {
            callsMade: totalCallsMade,
            connectionRate: totalCallsMade > 0 ? parseFloat(((totalConnections / totalCallsMade) * 100).toFixed(1)) : 0,
            activeAgents: agents.filter(a => a.status !== 'Offline').length,
            liveCampaigns: activeCampaigns.length,
            callsOverTime: MOCK_DIALER_STATS.callsOverTime, // Static for now
            campaignProgress: activeCampaigns.map(c => ({
                name: c.name,
                dialed: c.dialedLeads,
                total: c.totalLeads,
            })),
        };
    }
}
export class BillingService {
    static async getInfo(env: Env): Promise<BillingInfo> {
        const settingsEntity = new SettingsEntity(env);
        const settings = await settingsEntity.getState();
        const aiServiceCostPerMinute = settings.aiBasePricePerMinute;
        const sipCostPerMinute = settings.aiAgentSipMinuteCost;
        const totalBaseCostPerMinute = aiServiceCostPerMinute + sipCostPerMinute;
        // Simulate fetching dynamic price. If Sippulse API key is present, we get a better rate.
        const basePrice = settings.sippulseApiKey ? 0.048 : 0.050;
        const pricePerMinute = await new Promise<number>(resolve =>
            setTimeout(() => resolve(basePrice + Math.random() * 0.002 - 0.001), 200)
        );
        const { currentUsageMinutes, cycleEndDate, history } = MOCK_BILLING_INFO;
        const profitPerMinute = pricePerMinute - totalBaseCostPerMinute;
        const totalProfit = profitPerMinute * currentUsageMinutes;
        const costUsdPerMs = totalBaseCostPerMinute / 60000;
        return {
            currentUsageMinutes,
            cycleEndDate,
            history,
            pricePerMinute,
            aiServiceCostPerMinute,
            sipCostPerMinute,
            totalBaseCostPerMinute,
            profitPerMinute,
            totalProfit,
            costUsdPerMs,
        };
    }
}
export class UserDashboardService {
    static async getInfo(env: Env): Promise<UserDashboardInfo> {
        const settingsEntity = new SettingsEntity(env);
        const settings = await settingsEntity.getState();
        const totalBaseCostPerMinute = settings.aiBasePricePerMinute + settings.aiAgentSipMinuteCost;
        const info = { ...MOCK_USER_DASHBOARD_INFO };
        info.aiCostThisCycle = info.totalAiMinutesUsed * totalBaseCostPerMinute;
        return info;
    }
    static async changePassword(data: ChangePasswordData): Promise<{ success: boolean }> {
        // In a real application, this would involve hashing the new password
        // and updating the user's record in a database.
        console.log("Password change requested:", {
            currentPassword: '[REDACTED]',
            newPassword: '[REDACTED]',
        });
        // Simulate a successful password change.
        if (data.currentPassword === "password123") { // Simulate correct current password
            return { success: true };
        }
        throw new Error("Incorrect current password.");
    }
}
export class DialerSimulationService {
    static async tick(env: Env) {
        console.log("Running dialer simulation tick...");
        const campaigns = (await CampaignEntity.list(env)).items;
        const agents = (await AgentEntity.list(env)).items;
        const activeCampaigns = campaigns.filter(c => c.status === 'Active');
        for (const campaign of activeCampaigns) {
            const campaignEntity = new CampaignEntity(env, campaign.id);
            let { dialedLeads, connections, status } = campaign;
            if (dialedLeads >= campaign.totalLeads) {
                status = 'Completed';
            } else {
                const callsThisTick = Math.floor(Math.random() * 5) + 1;
                dialedLeads = Math.min(campaign.totalLeads, dialedLeads + callsThisTick);
                const connectionsThisTick = Math.random() < 0.3 ? Math.floor(callsThisTick * Math.random()) : 0;
                connections += connectionsThisTick;
            }
            await campaignEntity.patch({ dialedLeads, connections, status });
        }
        for (const agent of agents) {
            const agentEntity = new AgentEntity(env, agent.id);
            let { status, currentCallDuration } = agent;
            if (status === 'On Call') {
                if (currentCallDuration > (Math.random() * 180 + 60)) {
                    status = 'Waiting';
                    currentCallDuration = 0;
                } else {
                    currentCallDuration += 10;
                }
            } else if (status === 'Waiting') {
                if (activeCampaigns.length > 0 && Math.random() < 0.2) {
                    status = 'On Call';
                    currentCallDuration = 0;
                }
            }
            await agentEntity.patch({ status, currentCallDuration });
        }
    }
}