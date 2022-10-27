import axios from 'axios';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import { Cardholder } from './cardholders';
import env from './env';
import { delay } from './utils/delay';

const endpoint = env.FRESHDESK_ENDPOINT;
const apiKey = env.FRESHDESK_API_KEY;

const freshdeskClient = axios.create({
    baseURL: `https://${endpoint}.freshdesk.com/`,
    auth: { username: apiKey, password: '' },
    timeout: 10000,
});

export const updateFreshdeskPhotos = async (cardholders: Cardholder[]) => {
    const contacts = await getContacts();
    for (const cardholder of cardholders) {
        const contact = contacts.find(
            (contact) =>
                contact.name ===
                `${cardholder.firstName} ${cardholder.lastName}`
        );
        if (contact != null) {
            console.log(contact.name);
            await updateContact(contact.id, cardholder.photoFilepath);
        }
    }
};

const getContacts = async () => {
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
};

const updateContact = async (contactId: string, photoFilepath: string) => {
    try {
        const formData = new FormData();
        formData.append('avatar', createReadStream(photoFilepath));
        await freshdeskClient.put(`api/v2/contacts/${contactId}`, formData);
    } catch (err: any) {
        console.error(err.message);
    }
};
