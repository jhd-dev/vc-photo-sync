import axios from 'axios';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import { delay } from './utils/delay';

const endpoint = 'valleycollaborative';
const FRESHDESK_API_KEY = 'oVoz8qD5Gg1MuG1yjy0';
const photoDir = `../../../GCS/System Galaxy/Badging/AdpPhotos/00000`;

const freshdeskClient = axios.create({
    baseURL: `https://${endpoint}.freshdesk.com/`,
    auth: { username: FRESHDESK_API_KEY, password: '' },
    timeout: 10000,
});

export async function updateFreshdeskPhotos() {
    const contacts = await getContacts();
    for (const contact of contacts) {
        const splitName = contact.name.split(' ');
        const lastName = splitName.pop();
        const firstName = splitName.join(' ');
        console.log(splitName);
        await updateContact(firstName, lastName, contact.id);
    }
}

// async function getNames() {
//     try {
//         const allFiles = await readdir(photoDir);
//         const filteredFiles = allFiles.filter(
//             (file) =>
//                 file.split('_').length === 2 &&
//                 !/[0-9]/g.test(file) &&
//                 file.substring(0, 1) !== '.'
//         );
//         return filteredFiles;
//     } catch (err: unknown) {
//         console.error(err);
//     }
// }

async function getContacts() {
    let hasMore = true;
    let page = 1;
    const contacts: any[] = [];
    while (hasMore) {
        try {
            const {
                data: { results: newContacts },
            } = await freshdeskClient.get(`api/v2/search/contacts`, {
                params: { page, query: '"active:true"' },
            });
            page++;
            hasMore = page < 20;
            contacts.push(...newContacts);
            await delay(1000);
        } catch (err: unknown) {
            console.error(err);
            return contacts;
        }
    }
    return contacts;
}

async function updateContact(
    firstName: string,
    lastName: string,
    contactId: number
) {
    try {
        const formData = new FormData();
        formData.append(
            'avatar',
            createReadStream(`${photoDir}/${firstName}_${lastName}.jpg`)
        );
        await freshdeskClient.put(`api/v2/contacts/${contactId}`, formData);
    } catch (err: any) {
        console.error(err.message);
    }
}