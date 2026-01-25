import { Env } from "./core-utils";
import { CreateAgentData, KlassifierAgent } from "@shared/types";

export class KlassifierService {
    static async createAgent(env: Env, data: CreateAgentData): Promise<KlassifierAgent> {
        const apiKey = "8a821f95-b439-41ed-8410-61cc3422e28c"; // Hardcoded to bypass sync issues
        const baseUrl = env.KLASSIFIER_API_URL || "https://api.klassifier.com/klassifier/api/voice-agents";
        const url = baseUrl;

        console.log(`Creating agent via Klassifier API: ${url}`);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "NEV-API-KEY": apiKey,
                "User-Agent": "Talku-AI-Worker/1.0",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Klassifier API Error (Create ${response.status}):`, errorText);
            throw new Error(`Klassifier API create failed: ${response.status} ${response.statusText}`);
        }

        return await response.json() as KlassifierAgent;
    }

    static async listAgents(env: Env): Promise<KlassifierAgent[]> {
        const apiKey = "8a821f95-b439-41ed-8410-61cc3422e28c"; // Hardcoded to bypass sync issues
        const baseUrl = env.KLASSIFIER_API_URL || "https://api.klassifier.com/klassifier/api/voice-agents";

        // Klassifier API typically returns a list for GET /voice-agents
        const url = baseUrl;
        console.log(`Listing agents via Klassifier API: ${url}`);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "NEV-API-KEY": apiKey,
                "User-Agent": "Talku-AI-Worker/1.0",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Klassifier API Error (List ${response.status}):`, errorText);
            throw new Error(`Klassifier API list failed: ${response.status} ${response.statusText}`);
        }

        // Adjust depending on actual response structure (array vs object with items)
        const data = await response.json();
        if (Array.isArray(data)) {
            return data as KlassifierAgent[];
        } else if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as any).content)) {
            // Handle pagination structure if it exists
            return (data as any).content as KlassifierAgent[];
        }

        // Fallback or empty if structure unexpected
        console.warn("Unexpected Klassifier API response structure for list:", data);
        return [];
    }

    static async getAgent(env: Env, id: string | number): Promise<KlassifierAgent> {
        const apiKey = "8a821f95-b439-41ed-8410-61cc3422e28c"; // Hardcoded to bypass sync issues
        const baseUrl = env.KLASSIFIER_API_URL || "https://api.klassifier.com/klassifier/api/voice-agents";
        const url = `${baseUrl}/${id}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "NEV-API-KEY": apiKey,
                "User-Agent": "Talku-AI-Worker/1.0",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Klassifier API Error (Get ${response.status}):`, errorText);
            throw new Error(`Klassifier API get failed: ${response.status} ${response.statusText}`);
        }

        return await response.json() as KlassifierAgent;
    }

    static async updateAgent(env: Env, id: string | number, data: Partial<CreateAgentData>): Promise<KlassifierAgent> {
        const apiKey = "8a821f95-b439-41ed-8410-61cc3422e28c"; // Hardcoded to bypass sync issues
        const baseUrl = env.KLASSIFIER_API_URL || "https://api.klassifier.com/klassifier/api/voice-agents";
        const url = `${baseUrl}/${id}`;

        console.log(`Updating agent ${id} via Klassifier API: ${url}`);

        const response = await fetch(url, {
            method: "PUT", // or PATCH, verify with standard practices or docs if available, usually PUT for full update
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "NEV-API-KEY": apiKey,
                "User-Agent": "Talku-AI-Worker/1.0",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Klassifier API Error (Update ${response.status}):`, errorText);
            throw new Error(`Klassifier API update failed: ${response.status} ${response.statusText}`);
        }

        return await response.json() as KlassifierAgent;
    }

    static async deleteAgent(env: Env, id: string | number): Promise<boolean> {
        const apiKey = "8a821f95-b439-41ed-8410-61cc3422e28c"; // Hardcoded to bypass sync issues
        const baseUrl = env.KLASSIFIER_API_URL || "https://api.klassifier.com/klassifier/api/voice-agents";
        const url = `${baseUrl}/${id}`;

        console.log(`Deleting agent ${id} via Klassifier API: ${url}`);

        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Accept": "application/json", // Some APIs might return content on delete
                "NEV-API-KEY": apiKey,
                "User-Agent": "Talku-AI-Worker/1.0",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Klassifier API Error (Delete ${response.status}):`, errorText);
            throw new Error(`Klassifier API delete failed: ${response.status} ${response.statusText}`);
        }

        return true;
    }
}
