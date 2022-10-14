import { authenticate } from '@google-cloud/local-auth';
import { readFile, writeFile } from 'fs/promises';
import { google } from 'googleapis';
import { join } from 'path';
import { getCardholders } from './galaxy';

const scopes = ['https://www.googleapis.com/auth/admin.directory.user'];
const tokenPath = join(process.cwd(), 'google-token.json');
const credentialsPath = join(process.cwd(), 'google-credentials.json');

const loadSavedCredentials = async () => {
    try {
        const content = await readFile(tokenPath);
        const credentials = JSON.parse(content.toString());
        return google.auth.fromJSON(credentials);
    } catch (err: unknown) {
        return null;
    }
};

const saveCredentials = async (client: any) => {
    const content = await readFile(credentialsPath);
    const keys = JSON.parse(content.toString());
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await writeFile(tokenPath, payload);
};

export const authorize = async () => {
    const existingClient = await loadSavedCredentials();
    if (existingClient) return existingClient;

    const newClient = (await authenticate({
        scopes: scopes,
        keyfilePath: credentialsPath,
    })) as any;
    if (newClient.credentials) await saveCredentials(newClient);
    return newClient;
};

export const updateAllProfilePhotos = async (auth: any) => {
    console.log('updateAllProfilePhotos');
    const service = google.admin({ version: 'directory_v1', auth });
    const cardholders = await getCardholders();

    for (const cardholder of cardholders) {
        console.log(cardholder);
        try {
            console.log('searching for user');
            const userKey = `${cardholder.firstName[0].toLowerCase()}${cardholder.lastName.toLowerCase()}@valleycollaborative.org`;
            const { data: user } = await service.users.get({ userKey });
            if (
                !user ||
                user.name.givenName[1].toLowerCase() !==
                    cardholder.firstName[1].toLowerCase()
            )
                continue;

            try {
                console.log("checking user's photo");
                await service.users.photos.get({ userKey: user.id });
            } catch (err: unknown) {
                // User has no photo set yet
                console.log('User has no photo set yet');
                const photo = await readFile(cardholder.photoFilepath, {
                    encoding: 'base64url',
                });
                try {
                    await service.users.photos.update({
                        userKey: user.id,
                        requestBody: { photoData: photo, mimeType: 'JPEG' },
                    });
                    console.log('UPDATE SUCCESSFUL?');
                } catch (err: unknown) {
                    console.error(err);
                }
            }
        } catch (err: unknown) {
            // Couldn't find user of the given name
            console.log(
                `Couldn't find user of the given name ${cardholder.firstName} ${cardholder.lastName}`
            );
            continue;
        }
    }
};
