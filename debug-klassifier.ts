import { KlassifierService } from './worker/klassifier-service';
import { Env } from './worker/core-utils';

const mockEnv = {
    KLASSIFIER_API_KEY: '8a821f95-b439-41ed-8410-61cc3422e28c',
    KLASSIFIER_API_URL: 'https://api.klassifier.com/klassifier/api/voice-agents',
    GlobalDurableObject: {} as any // Mock
};

async function test() {
    try {
        console.log("Testing KlassifierService.listAgents...");
        const agents = await KlassifierService.listAgents(mockEnv);
        console.log("Success! Agents found:", agents.length);
        console.log(JSON.stringify(agents, null, 2));
    } catch (error) {
        console.error("Test Failed:", error);
    }
}

test();
