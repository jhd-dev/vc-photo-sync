import { config } from 'dotenv';
import { z } from 'zod';

const envSchema = z.object({
    AZURE_AD_CLIENT_ID: z.string(),
    AZURE_AD_CLIENT_SECRET: z.string(),
    AZURE_AD_TENANT_ID: z.string(),
    FRESHDESK_API_KEY: z.string(),
    FRESHDESK_ENDPOINT: z.string(),
});

const envResult = config();

if (envResult?.error) throw new Error(envResult.error.message);

const env = envSchema.parse(envResult.parsed);

export default env;
