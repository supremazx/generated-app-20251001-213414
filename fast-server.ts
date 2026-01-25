import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { userRoutes } from './worker/user-routes';
import { GlobalStorage } from './worker/core-utils';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('/api/*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'NEV-API-KEY']
}));

// API Routes
app.get('/api/health', (c) => c.json({
    success: true,
    data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        runtime: 'node-sqlite'
    }
}));

// Mount user routes
// We pass a mock "Env" because we removed the Cloudflare bindings requirements from core-utils
// The classes now self-manage via the singleton SQLite connection.
userRoutes(app as any);

// Static Assets
// Serve index.html for SPA fallback
app.use('*', serveStatic({ root: './dist/client' }));
app.notFound(async (c) => {
    // Check if it's an API call, if so return JSON 404
    if (c.req.path.startsWith('/api/')) {
        return c.json({ success: false, error: 'Not Found' }, 404);
    }
    // Otherwise serve index.html for client-side routing
    return serveStatic({ root: './dist/client', path: 'index.html' })(c, async () => { }) as Promise<Response>;
});

const port = Number(process.env.PORT) || 3000;
console.log(`Server is running heavily on port ${port}`);

// Simulation Tick (Background Loop)
setInterval(() => {
    GlobalStorage.alarm({} as any).catch(e => console.error("Alarm tick failed:", e));
}, 10000);

serve({
    fetch: app.fetch,
    port
});
