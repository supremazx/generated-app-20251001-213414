import { Hono } from "hono";
import type { Env } from './core-utils';
import { CampaignEntity, AgentEntity, CallListEntity, DialerStatsService, SettingsEntity, BillingService, UserDashboardService } from "./entities";
import { ok, bad, notFound } from './core-utils';
import { CreateCampaignSchema, EditCampaignSchema, Campaign, CallList, UpdateCampaignStatusSchema, SettingsSchema, ChangePasswordSchema } from "@shared/types";
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
    await CampaignEntity.ensureSeed(c.env);
    const page = await CampaignEntity.list(c.env);
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
  app.post('/api/campaigns', async (c) => {
    const body = await c.req.json();
    const validation = CreateCampaignSchema.safeParse(body);
    if (!validation.success) {
      return bad(c, 'Invalid campaign data');
    }
    const { name, callListId } = validation.data;
    const callListEntity = new CallListEntity(c.env, callListId);
    if (!(await callListEntity.exists())) {
        return bad(c, 'Call list not found');
    }
    const callList = await callListEntity.getState();
    const newCampaign: Campaign = {
      id: crypto.randomUUID(),
      name,
      callListId,
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
    await AgentEntity.ensureSeed(c.env);
    const page = await AgentEntity.list(c.env);
    return ok(c, page.items);
  });
  // CALL LISTS
  app.get('/api/call-lists', async (c) => {
    await CallListEntity.ensureSeed(c.env);
    const page = await CallListEntity.list(c.env);
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
}