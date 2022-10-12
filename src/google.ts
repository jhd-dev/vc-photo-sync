import { authenticate } from '@google-cloud/local-auth';
import { readFile, writeFile } from 'fs/promises';
import { google } from 'googleapis';
import { join } from 'path';
import { getCardholders } from './galaxy';

const SCOPES = ['https://www.googleapis.com/auth/admin.directory.user'];
const TOKEN_PATH = join(process.cwd(), 'google-token.json');
const CREDENTIALS_PATH = join(process.cwd(), 'google-credentials.json');

async function loadSavedCredentialsIfExist() {
    try {
        const content = await readFile(TOKEN_PATH);
        const credentials = JSON.parse(content.toString());
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

async function saveCredentials(client: any) {
    const content = await readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content.toString());
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await writeFile(TOKEN_PATH, payload);
}

export async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = (await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    })) as any;
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

export async function updateAllProfilePhotos(auth: any) {
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
                    const res = await service.users.photos.update({
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
            // console.error(err);
            continue;
        }
    }
}
