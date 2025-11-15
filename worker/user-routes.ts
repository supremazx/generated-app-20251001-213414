import { Hono } from "hono";
import type { Env } from './core-utils';
import { CampaignEntity, AgentEntity, CallListEntity, DialerStatsService, SettingsEntity, BillingService, UserDashboardService, ResellerClientEntity, ResellerDashboardService, ResellerBillingService, VogentAgentService, KnowledgeBaseEntity, AudioFileEntity, CallLogEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import { CreateCampaignSchema, EditCampaignSchema, Campaign, CallList, UpdateCampaignStatusSchema, SettingsSchema, ChangePasswordSchema, CreateResellerClientSchema, ResellerClient, EditResellerClientSchema, UpdateClientStatusSchema, KnowledgeBase, AudioFile, CallLog, ChangeEmailSchema } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // DASHBOARD
  app.get('/api/dashboard/stats', async (c) => {
    const stats = await DialerStatsService.getStats(c.env);
    return ok(c, stats);
  });
  // USER DASHBOARD
  app.get('/api/user-dashboard', async (c) => {
    const userInfo = await UserDashboardService.getInfo(c.env);
    return ok(c, userInfo);
  });
  // USER ACTIONS
  app.post('/api/user/change-email', async (c) => {
    const body = await c.req.json();
    const validation = ChangeEmailSchema.safeParse(body);
    if (!validation.success) {
      return bad(c, 'Invalid email data');
    }
    try {
      const result = await UserDashboardService.changeEmail(validation.data);
      return ok(c, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      return bad(c, message);
    }
  });
  app.post('/api/user/change-password', async (c) => {
    const body = await c.req.json();
    const validation = ChangePasswordSchema.safeParse(body);
    if (!validation.success) {
      return bad(c, 'Invalid password data');
    }
    try {
      const result = await UserDashboardService.changePassword(validation.data);
      return ok(c, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      return bad(c, message);
    }
  });
  // CAMPAIGNS
  app.get('/api/campaigns', async (c) => {
    const userId = c.req.query('userId');
    await CampaignEntity.ensureSeed(c.env);
    const page = await CampaignEntity.list(c.env);
    if (userId) {
        // Simulate filtering for a specific user. Return a subset.
        return ok(c, page.items.slice(0, 2));
    }
    return ok(c, page.items);
  });
  app.get('/api/campaigns/:id', async (c) => {
    const id = c.req.param('id');
    const campaignEntity = new CampaignEntity(c.env, id);
    if (!(await campaignEntity.exists())) {
        return notFound(c, 'Campaign not found');
    }
    const campaign = await campaignEntity.getState();
    return ok(c, campaign);
  });
  app.get('/api/campaigns/:id/logs', async (c) => {
    const campaignId = c.req.param('id');
    await CallLogEntity.ensureSeed(c.env);
    const allLogs = (await CallLogEntity.list(c.env)).items;
    const campaignLogs = allLogs.filter(log => log.campaignId === campaignId);
    return ok(c, campaignLogs);
  });
  app.post('/api/campaigns', async (c) => {
    const body = await c.req.json();
    const validation = CreateCampaignSchema.safeParse(body);
    if (!validation.success) {
      return bad(c, 'Invalid campaign data');
    }
    const { name, callListId, agentId, knowledgeBaseId, audioFileId } = validation.data;
    const callListEntity = new CallListEntity(c.env, callListId);
    if (!(await callListEntity.exists())) {
        return bad(c, 'Call list not found');
    }
    const callList = await callListEntity.getState();
    const newCampaign: Campaign = {
      id: crypto.randomUUID(),
      name,
      callListId,
      agentId,
      knowledgeBaseId,
      audioFileId,
      status: 'Draft',
      totalLeads: callList.totalLeads,
      dialedLeads: 0,
      connections: 0,
      createdAt: new Date().toISOString(),
    };
    await CampaignEntity.create(c.env, newCampaign);
    return ok(c, newCampaign);
  });
  app.put('/api/campaigns/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const validation = EditCampaignSchema.safeParse(body);
    if (!validation.success) {
        return bad(c, 'Invalid campaign data');
    }
    const campaignEntity = new CampaignEntity(c.env, id);
    if (!(await campaignEntity.exists())) {
        return notFound(c, 'Campaign not found');
    }
    await campaignEntity.patch(validation.data);
    const updatedCampaign = await campaignEntity.getState();
    return ok(c, updatedCampaign);
  });
  app.delete('/api/campaigns/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await CampaignEntity.delete(c.env, id);
    if (!deleted) {
      return notFound(c, 'Campaign not found');
    }
    return ok(c, { id });
  });
  app.post('/api/campaigns/:id/status', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const validation = UpdateCampaignStatusSchema.safeParse(body);
    if (!validation.success) {
        return bad(c, 'Invalid status data');
    }
    const { status } = validation.data;
    const campaignEntity = new CampaignEntity(c.env, id);
    if (!(await campaignEntity.exists())) {
        return notFound(c, 'Campaign not found');
    }
    await campaignEntity.patch({ status });
    const updatedCampaign = await campaignEntity.getState();
    return ok(c, updatedCampaign);
  });
  // AGENTS
  app.get('/api/agents', async (c) => {
    const agents = await VogentAgentService.list();
    return ok(c, agents);
  });
  // CALL LISTS
  app.get('/api/call-lists', async (c) => {
    const userId = c.req.query('userId');
    await CallListEntity.ensureSeed(c.env);
    const page = await CallListEntity.list(c.env);
    if (userId) {
        return ok(c, page.items.slice(0, 3));
    }
    return ok(c, page.items);
  });
  app.get('/api/call-lists/:id', async (c) => {
    const id = c.req.param('id');
    const callListEntity = new CallListEntity(c.env, id);
    if (!(await callListEntity.exists())) {
        return notFound(c, 'Call List not found');
    }
    const callList = await callListEntity.getState();
    return ok(c, callList);
  });
  app.post('/api/call-lists', async (c) => {
    const formData = await c.req.formData();
    const file = formData.get('file');
    const name = formData.get('name');
    if (!(file instanceof File)) {
      return bad(c, 'File is required');
    }
    if (typeof name !== 'string' || name.length < 3) {
      return bad(c, 'List name must be at least 3 characters long.');
    }
    try {
      const fileContent = await file.text();
      const lineCount = fileContent.split('\n').filter(line => line.trim() !== '').length;
      const totalLeads = Math.max(0, lineCount > 0 ? lineCount - 1 : 0); // Subtract header
      const newCallList: CallList = {
        id: crypto.randomUUID(),
        name,
        totalLeads,
        dialedLeads: 0,
        uploadedAt: new Date().toISOString(),
      };
      await CallListEntity.create(c.env, newCallList);
      return ok(c, newCallList);
    } catch (e) {
      console.error("Error parsing CSV:", e);
      return bad(c, 'Could not parse the uploaded CSV file.');
    }
  });
  app.delete('/api/call-lists/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await CallListEntity.delete(c.env, id);
    if (!deleted) {
      return notFound(c, 'Call list not found');
    }
    return ok(c, { id });
  });
  // KNOWLEDGE BASES
  app.get('/api/knowledge-bases', async (c) => {
    const userId = c.req.query('userId');
    const page = await KnowledgeBaseEntity.list(c.env);
    if (userId) {
        return ok(c, page.items.slice(0, 1));
    }
    return ok(c, page.items);
  });
  app.post('/api/knowledge-bases', async (c) => {
    const formData = await c.req.formData();
    const file = formData.get('file');
    const name = formData.get('name');
    if (!(file instanceof File)) {
      return bad(c, 'File is required');
    }
    if (typeof name !== 'string' || name.length < 3) {
      return bad(c, 'Knowledge base name must be at least 3 characters long.');
    }
    try {
      let leadCount = 0;
      if (file.type === 'text/csv' || file.type === 'text/plain') {
        const fileContent = await file.text();
        const lineCount = fileContent.split('\n').filter(line => line.trim() !== '').length;
        leadCount = Math.max(0, lineCount > 0 ? lineCount - 1 : 0); // Subtract header for CSV
      } else {
        // Simulate processing for PDF/Excel as we can't parse them here
        leadCount = Math.floor(Math.random() * (5000 - 50 + 1)) + 50;
      }
      const newKnowledgeBase: KnowledgeBase = {
        id: crypto.randomUUID(),
        name,
        leadCount,
        uploadedAt: new Date().toISOString(),
      };
      await KnowledgeBaseEntity.create(c.env, newKnowledgeBase);
      return ok(c, newKnowledgeBase);
    } catch (e) {
      console.error("Error processing knowledge base file:", e);
      return bad(c, 'Could not process the uploaded file.');
    }
  });
  app.delete('/api/knowledge-bases/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await KnowledgeBaseEntity.delete(c.env, id);
    if (!deleted) {
      return notFound(c, 'Knowledge base not found');
    }
    return ok(c, { id });
  });
  // AUDIO FILES
  app.get('/api/audio-files', async (c) => {
    const userId = c.req.query('userId');
    const page = await AudioFileEntity.list(c.env);
    if (userId) {
        return ok(c, page.items.slice(0, 2));
    }
    return ok(c, page.items);
  });
  app.post('/api/audio-files', async (c) => {
    const formData = await c.req.formData();
    const file = formData.get('file');
    const name = formData.get('name');
    if (!(file instanceof File)) {
      return bad(c, 'File is required');
    }
    if (typeof name !== 'string' || name.length < 3) {
      return bad(c, 'Audio file name must be at least 3 characters long.');
    }
    // NOTE: In a real scenario, you would upload the file to a storage service (like R2)
    // and store the URL. Here, we only store metadata.
    const newAudioFile: AudioFile = {
      id: crypto.randomUUID(),
      name,
      fileName: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };
    await AudioFileEntity.create(c.env, newAudioFile);
    return ok(c, newAudioFile);
  });
  app.delete('/api/audio-files/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await AudioFileEntity.delete(c.env, id);
    if (!deleted) {
      return notFound(c, 'Audio file not found');
    }
    return ok(c, { id });
  });
  // SETTINGS
  app.get('/api/settings', async (c) => {
    const settingsEntity = new SettingsEntity(c.env);
    const settings = await settingsEntity.getState();
    return ok(c, settings);
  });
  app.post('/api/settings', async (c) => {
    const body = await c.req.json();
    const validation = SettingsSchema.safeParse(body);
    if (!validation.success) {
      return bad(c, 'Invalid settings data');
    }
    const settingsEntity = new SettingsEntity(c.env);
    await settingsEntity.save(validation.data);
    return ok(c, validation.data);
  });
  // BILLING
  app.get('/api/billing', async (c) => {
    const billingInfo = await BillingService.getInfo(c.env);
    return ok(c, billingInfo);
  });
  // CLIENTS (formerly Reseller Clients)
  app.get('/api/clients', async (c) => {
    await ResellerClientEntity.ensureSeed(c.env);
    const page = await ResellerClientEntity.list(c.env);
    return ok(c, page.items);
  });
  app.post('/api/clients', async (c) => {
    const body = await c.req.json();
    const validation = CreateResellerClientSchema.safeParse(body);
    if (!validation.success) {
      return bad(c, 'Invalid client data');
    }
    const { companyName, contactEmail, agentId } = validation.data;
    const newClient: ResellerClient = {
      id: `rc-${crypto.randomUUID().slice(0, 8)}`,
      companyName,
      contactEmail,
      agentId,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };
    await ResellerClientEntity.create(c.env, newClient);
    return ok(c, newClient);
  });
  app.put('/api/clients/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const validation = EditResellerClientSchema.safeParse(body);
    if (!validation.success) {
        return bad(c, 'Invalid client data');
    }
    const clientEntity = new ResellerClientEntity(c.env, id);
    if (!(await clientEntity.exists())) {
        return notFound(c, 'Client not found');
    }
    await clientEntity.patch(validation.data);
    const updatedClient = await clientEntity.getState();
    return ok(c, updatedClient);
  });
  app.delete('/api/clients/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await ResellerClientEntity.delete(c.env, id);
    if (!deleted) {
      return notFound(c, 'Client not found');
    }
    return ok(c, { id });
  });
  app.post('/api/clients/:id/status', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const validation = UpdateClientStatusSchema.safeParse(body);
    if (!validation.success) {
        return bad(c, 'Invalid status data');
    }
    const { status } = validation.data;
    const clientEntity = new ResellerClientEntity(c.env, id);
    if (!(await clientEntity.exists())) {
        return notFound(c, 'Client not found');
    }
    await clientEntity.patch({ status });
    const updatedClient = await clientEntity.getState();
    return ok(c, updatedClient);
  });
  // RESELLER PANEL
  app.get('/api/reseller/dashboard', async (c) => {
    const stats = await ResellerDashboardService.getStats(c.env);
    return ok(c, stats);
  });
  app.get('/api/reseller/billing', async (c) => {
    const info = await ResellerBillingService.getInfo(c.env);
    return ok(c, info);
  });
}