import { WebhookConfig } from '../types';

export const triggerWebhook = async (config: WebhookConfig, data: any) => {
    if (!config.active || !config.url) return;

    try {
        const response = await fetch(config.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event: config.event,
                timestamp: Date.now(),
                data: data
            }),
        });

        if (!response.ok) {
            throw new Error(`Webhook failed with status ${response.status}`);
        }

        console.log(`Webhook ${config.name} triggered successfully`);
        return true;
    } catch (error) {
        console.error(`Error triggering webhook ${config.name}:`, error);
        return false;
    }
};

export const triggerAllWebhooks = async (configs: WebhookConfig[] | undefined, event: string, data: any) => {
    if (!configs || configs.length === 0) return;

    const activeWebhooks = configs.filter(c => c.active && c.event === event);
    return Promise.all(activeWebhooks.map(config => triggerWebhook(config, data)));
};
