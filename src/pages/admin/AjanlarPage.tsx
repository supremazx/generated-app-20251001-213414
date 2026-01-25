import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateAgentSchema, type CreateAgentData, type KlassifierAgent } from '@shared/types';
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Pencil, RefreshCw, Upload } from "lucide-react";
import { UploadKnowledgeBaseDialog } from '@/components/UploadKnowledgeBaseDialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useKnowledgeBaseStore } from "@/stores/useKnowledgeBaseStore";
import { useVoiceStore } from "@/stores/useVoiceStore";

export function AjanlarPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [agents, setAgents] = useState<KlassifierAgent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingAgentId, setEditingAgentId] = useState<number | string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const { knowledgeBases, fetchKnowledgeBases } = useKnowledgeBaseStore();
    const { voices, fetchVoices } = useVoiceStore();

    const form = useForm<CreateAgentData>({
        resolver: zodResolver(CreateAgentSchema),
        defaultValues: {
            name: "",
            language: "tr-TR",
            voice: "Melis",
            emotion: "neutral",
            speed: 1.0,
            systemPrompt: "Sen yardımsever ve nazik bir konuşma asistanısın.",
            agentSpeaksFirst: true,
            defineFirstMessage: true,
            firstMessage: "Merhaba, Flow'a hoş geldin! Sana nasıl yardımcı olabilirim?",
            useStreamTTS: false,
            useAllianzMode: false,
            customDictionary: "",
            knowledgeBaseIds: [],
        },
    });

    useEffect(() => {
        fetchAgents();
        fetchKnowledgeBases();
        fetchVoices();
    }, []);

    const fetchAgents = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/agents');
            if (response.ok) {
                const json = await response.json();
                if (json.success && Array.isArray(json.data)) {
                    setAgents(json.data);
                } else if (Array.isArray(json)) {
                    // Fallback in case raw array is returned (unlikely given core-utils but good for safety)
                    setAgents(json);
                } else {
                    console.error("Unexpected response format:", json);
                    setAgents([]);
                }
            } else {
                let errorMessage = "Ajanlar yüklenemedi.";
                try {
                    const errorData = await response.json();
                    if (errorData.details) errorMessage += ` (${errorData.details})`;
                    else if (errorData.detail) errorMessage += ` (${errorData.detail})`;
                    else if (errorData.error) errorMessage += ` (${errorData.error})`;
                } catch (e) {
                    console.error("Error parsing error response:", e);
                }
                console.error("Failed to fetch agents:", errorMessage);
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error("Error fetching agents:", error);
            toast.error("Ajanlar yüklenirken hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number | string) => {
        if (!confirm("Bu ajanı silmek istediğinizden emin misiniz?")) return;

        try {
            const response = await fetch(`/api/agents/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success("Ajan başarıyla silindi");
                fetchAgents();
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || "Ajan silinemedi");
            }
        } catch (error) {
            console.error("Error deleting agent:", error);
            toast.error("Ajan silinirken hata oluştu");
        }
    };

    const handleEdit = (agent: KlassifierAgent) => {
        setEditingAgentId(agent.id);
        form.reset({
            name: agent.name,
            language: agent.language,
            voice: agent.voice,
            emotion: agent.emotion,
            speed: agent.speed || 1.0,
            systemPrompt: agent.systemPrompt || "",
            agentSpeaksFirst: agent.agentSpeaksFirst,
            defineFirstMessage: agent.defineFirstMessage,
            firstMessage: agent.firstMessage || "",
            useStreamTTS: agent.useStreamTTS,
            useAllianzMode: agent.useAllianzMode,
            customDictionary: agent.customDictionary || "",
            knowledgeBaseIds: agent.knowledgeBaseIds || [],
        });
        setIsDialogOpen(true);
    };

    const handleCreateClick = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingAgentId(null);
        form.reset({
            name: "",
            language: "tr-TR",
            voice: "melis",
            emotion: "neutral",
            speed: 1.0,
            systemPrompt: "Sen yardımsever ve nazik bir konuşma asistanısın.",
            agentSpeaksFirst: true,
            defineFirstMessage: true,
            firstMessage: "Merhaba, Flow'a hoş geldin! Sana nasıl yardımcı olabilirim?",
            useStreamTTS: false,
            useAllianzMode: false,
            customDictionary: "",
            knowledgeBaseIds: [],
        });
    };

    async function onSubmit(data: CreateAgentData) {
        setIsSubmitting(true);
        try {
            console.log("Submitting agent data:", data);

            const url = editingAgentId ? `/api/agents/${editingAgentId}` : '/api/agents';
            const method = editingAgentId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json() as { error?: string, details?: { message?: string } };
                const errorMessage = errorData.details?.message || errorData.error || 'Ajan kaydedilemedi';
                throw new Error(errorMessage);
            }

            const savedAgent = await response.json();
            console.log("Agent saved:", savedAgent);

            toast.success(editingAgentId ? "Ajan başarıyla güncellendi!" : "Ajan başarıyla oluşturuldu!");
            setIsDialogOpen(false);
            resetForm();
            fetchAgents();
        } catch (error) {
            console.error("Error saving agent:", error);
            toast.error(error instanceof Error ? error.message : "Ajan kaydedilemedi. Lütfen tekrar deneyin.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ajanlar</h1>
                    <p className="text-muted-foreground">
                        Yapay zeka ajanlarınızı oluşturun, yönetin ve izleyin.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchAgents} disabled={isLoading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Yenile
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleCreateClick}>
                                <Plus className="mr-2 h-4 w-4" />
                                Ajan Üret
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingAgentId ? 'Ajan Düzenle' : 'Yeni Ajan Oluştur'}</DialogTitle>
                                <DialogDescription>
                                    {editingAgentId ? 'Bu ajanın yapılandırmasını güncelleyin.' : 'Yeni yapay zeka ajanınızın kişiliğini ve davranışlarını yapılandırın.'}
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Basic Info */}
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>İsim</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ajan İsmi" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="language"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Dil</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Dil seçin" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="tr-TR">Türkçe (tr-TR)</SelectItem>
                                                            <SelectItem value="en-US">İngilizce (en-US)</SelectItem>
                                                            {/* Add more languages as needed */}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="voice"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Ses</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Ses seçin" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {voices.map((voice) => (
                                                                <SelectItem key={voice.id} value={voice.name}>
                                                                    {voice.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="emotion"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Duygu</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Duygu seçin" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="neutral">Nötr</SelectItem>
                                                            <SelectItem value="happy">Mutlu</SelectItem>
                                                            <SelectItem value="sad">Üzgün</SelectItem>
                                                            <SelectItem value="angry">Kızgın</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="speed"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Hız ({field.value})</FormLabel>
                                                    <FormControl>
                                                        <Slider
                                                            min={0.5}
                                                            max={2.0}
                                                            step={0.1}
                                                            defaultValue={[field.value || 1.0]}
                                                            onValueChange={(vals) => field.onChange(vals[0])}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>Ses oynatma hızı.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* System Prompt */}
                                    <FormField
                                        control={form.control}
                                        name="systemPrompt"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sistem Yönergesi</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Sen yardımsever bir asistansın..."
                                                        className="min-h-[100px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Ajanın kişiliğini ve talimatlarını tanımlayın.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Booleans */}
                                        <FormField
                                            control={form.control}
                                            name="agentSpeaksFirst"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">Önce Ajan Konuşsun</FormLabel>
                                                        <FormDescription>
                                                            Konuşmayı ajan mı başlatsın?
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="defineFirstMessage"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">İlk Mesajı Belirle</FormLabel>
                                                        <FormDescription>
                                                            Karşılama mesajını manuel olarak ayarla.
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="useStreamTTS"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">Akışlı TTS (Stream TTS)</FormLabel>
                                                        <FormDescription>
                                                            Metin okuma için akış (stream) kullan.
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />


                                    </div>

                                    {form.watch("defineFirstMessage") && (
                                        <FormField
                                            control={form.control}
                                            name="firstMessage"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>İlk Mesaj</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Merhaba, bugün size nasıl yardımcı olabilirim?"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    <FormField
                                        control={form.control}
                                        name="knowledgeBaseIds"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bilgi Bankası</FormLabel>
                                                <div className="flex gap-2">
                                                    <Select
                                                        onValueChange={(value) => field.onChange(value === "none" ? [] : [value])}
                                                        value={field.value?.[0] || undefined}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="flex-1">
                                                                <SelectValue placeholder="Bilgi Bankası Seçin" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="none">Seçim Yok</SelectItem>
                                                            {knowledgeBases.map((kb) => (
                                                                <SelectItem key={kb.id} value={kb.id}>
                                                                    {kb.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => setIsUploadDialogOpen(true)}
                                                        title="Yeni Yükle"
                                                    >
                                                        <Upload className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <FormDescription>
                                                    Ajanın kullanacağı bilgi kaynağını seçin.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex gap-4">
                                        <Button type="submit" disabled={isSubmitting} className="flex-1">
                                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {editingAgentId ? 'Ajanı Güncelle' : 'Ajan Oluştur'}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Agents List */}
            <Card>
                <CardHeader>
                    <CardTitle>Ajanlarınız</CardTitle>
                    <CardDescription>Oluşturduğunuz tüm ajanların listesi.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && agents.length === 0 ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : agents.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                            Ajan bulunamadı. Aşağıdan yeni bir tane oluşturun!
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>İsim</TableHead>
                                    <TableHead>Dil</TableHead>
                                    <TableHead>Ses</TableHead>
                                    <TableHead>Oluşturulma Tarihi</TableHead>
                                    <TableHead className="text-right">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {agents.map((agent) => (
                                    <TableRow
                                        key={agent.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleEdit(agent)}
                                    >
                                        <TableCell className="font-medium">{agent.name}</TableCell>
                                        <TableCell>{agent.language}</TableCell>
                                        <TableCell>{agent.voice}</TableCell>
                                        {/* Handle createdAt which might be array or string */}
                                        <TableCell>
                                            {Array.isArray(agent.createdAt)
                                                ? new Date(agent.createdAt[0], agent.createdAt[1] - 1, agent.createdAt[2]).toLocaleDateString()
                                                : new Date(agent.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(agent);
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(agent.id);
                                                }}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            <UploadKnowledgeBaseDialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen} />
        </div>
    );
}
