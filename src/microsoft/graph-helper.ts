import 'isomorphic-fetch';
import {
    ClientSecretCredential,
    DeviceCodeCredential,
    DeviceCodePromptCallback,
} from '@azure/identity';
import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { User, Message } from '@microsoft/microsoft-graph-types';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { AppSettings } from './app-settings';

let _settings: AppSettings | undefined = undefined;
let _deviceCodeCredential: DeviceCodeCredential | undefined = undefined;
let _userClient: Client | undefined = undefined;

export function initGraphForUserAuth(
    settings: AppSettings,
    deviceCodePrompt: DeviceCodePromptCallback
) {
    if (!settings) throw new Error('Settings cannot be undefined');

    _settings = settings;

    _deviceCodeCredential = new DeviceCodeCredential({
        clientId: settings.clientId,
        tenantId: settings.authTenant,
        userPromptCallback: deviceCodePrompt,
    });

    const authProvider = new TokenCredentialAuthenticationProvider(
        _deviceCodeCredential,
        { scopes: settings.graphUserScopes }
    );

    _userClient = Client.initWithMiddleware({ authProvider });
}

let _clientSecretCredential: ClientSecretCredential | undefined = undefined;
let _appClient: Client | undefined = undefined;

function ensureGraphForAppOnlyAuth() {
    if (!_settings) throw new Error('Settings cannot be undefined');

    if (!_clientSecretCredential) {
        _clientSecretCredential = new ClientSecretCredential(
            _settings.tenantId,
            _settings.clientId,
            _settings.clientSecret
        );
    }

    if (!_appClient) {
        const authProvider = new TokenCredentialAuthenticationProvider(
            _clientSecretCredential,
            {
                scopes: ['https://graph.microsoft.com/.default'],
            }
        );

        _appClient = Client.initWithMiddleware({
            authProvider: authProvider,
        });
    }
}

export async function getMe(): Promise<User> {
    if (!_userClient)
        throw new Error('Graph has not been initialized for user auth');

    return (
        _userClient
            .api('/me')
            // Only request specific properties
            .select(['displayName', 'mail', 'userPrincipalName'])
            .get()
    );
}

export async function getUser(userId: string): Promise<User> {
    if (!_userClient)
        throw new Error('Graph has not been initialized for user auth');

    return _userClient
        .api(`/users/${userId}`)
        .select(['displayName', 'mail', 'userPrincipalName'])
        .get();
}

export const getUsers = async (): Promise<PageCollection> => {
    ensureGraphForAppOnlyAuth();
    return _appClient
        ?.api('/users')
        .select(['displayName', 'id', 'mail'])
        .top(25)
        .orderby('displayName')
        .get();
};

export const getUserById = (userId: string): Promise<User> => {
    ensureGraphForAppOnlyAuth();
    return _appClient
        .api(`/users/${userId}`)
        .select(['displayName', 'mail', 'userPrincipalName'])
        .get();
};

export const getUserPhoto = (userId: string) => {
    ensureGraphForAppOnlyAuth();
    return (
        _appClient
            .api(`/users/${userId}/photo`)
            // .select(['id', 'width', 'height'])
            .get()
    );
};

export const updateUserPhoto = (userId: string, photo: any) => {
    ensureGraphForAppOnlyAuth();
    return _appClient
        .api(`/users/${userId}/photo/$value`)
        .headers({ 'Content-Type': 'image/jpeg' })
        .put(photo);
};
