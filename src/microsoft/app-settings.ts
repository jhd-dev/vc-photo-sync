import env from '../env';

export interface AppSettings {
    clientId: string;
    clientSecret: string;
    tenantId: string;
    authTenant: string;
    graphUserScopes: string[];
}

const settings: AppSettings = {
    clientId: env.AZURE_AD_CLIENT_ID,
    clientSecret: env.AZURE_AD_CLIENT_SECRET,
    tenantId: env.AZURE_AD_TENANT_ID,
    authTenant: env.AZURE_AD_TENANT_ID,
    graphUserScopes: ['user.read', 'mail.read', 'mail.send'],
};

export default settings;
