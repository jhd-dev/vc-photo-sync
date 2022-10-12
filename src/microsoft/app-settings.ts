const settings: AppSettings = {
    clientId: process.env.AZURE_AD_CLIENT_ID,
    clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
    tenantId: process.env.AZURE_AD_TENANT_ID,
    authTenant: process.env.AZURE_AD_TENANT_ID,
    graphUserScopes: ['user.read', 'mail.read', 'mail.send'],
};

export interface AppSettings {
    clientId: string;
    clientSecret: string;
    tenantId: string;
    authTenant: string;
    graphUserScopes: string[];
}

export default settings;
