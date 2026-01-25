import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Voice } from '@shared/types';
import { toast } from 'sonner';

interface VoiceState {
    voices: Voice[];
    loading: boolean;
    error: string | null;
    fetchVoices: () => Promise<void>;
}

export const useVoiceStore = create<VoiceState>()(
    immer((set) => ({
        voices: [],
        loading: false,
        error: null,
        fetchVoices: async () => {
            set({ loading: true, error: null });
            try {
                const response = await fetch('https://api.klassifier.com/klassifier/tts/languages/33/voices', {
                    headers: {
                        'Accept': 'application/json',
                        'NEV-API-KEY': '8a821f95-b439-41ed-8410-61cc3422e28c'
                    }
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch voices: ${response.statusText}`);
                }

                const text = await response.text();
                let voiceList: Voice[] = [];

                if (text.trim().startsWith('<')) {
                    // Handle XML response
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(text, "text/xml");
                    const items = xmlDoc.getElementsByTagName("item");
                    // Assuming <item> structure based on log "<List><ite..." 
                    // Verify if it is <item> or <voice> etc. usually <item> in standard lists.
                    // User log said "<List><ite" which likely means <List><item>...

                    for (let i = 0; i < items.length; i++) {
                        const item = items[i];
                        // Try to find name tag or just use text content if it's a simple list
                        // Let's assume standard structure or extract text
                        const name = item.getAttribute("name") || item.textContent || `Voice ${i}`;
                        const id = item.getAttribute("id") || name;
                        if (name) {
                            voiceList.push({ id, name });
                        }
                    }
                    // Fallback if parsing failed or structure is different, try to regex names
                    if (voiceList.length === 0) {
                        // Attempt to extract anything looking like a name
                        const match = text.match(/<name>(.*?)<\/name>/g);
                        if (match) {
                            voiceList = match.map(m => {
                                const n = m.replace(/<\/?name>/g, '');
                                return { id: n, name: n };
                            });
                        }
                    }

                } else {
                    // Handle JSON
                    const data = JSON.parse(text);
                    voiceList = Array.isArray(data) ? data : data.data || [];
                }

                set({ voices: voiceList, loading: false });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to fetch voices';
                set({ loading: false, error: errorMessage });
                console.error("Voice fetch error:", error);
            }
        },
    }))
);
