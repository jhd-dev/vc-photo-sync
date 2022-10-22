import { DeviceCodeInfo } from '@azure/identity';
import { readFile } from 'fs/promises';
import { z } from 'zod';
import settings, { AppSettings } from './app-settings';
import {
    initGraphForUserAuth,
    getUserById,
    getUserPhoto,
    updateUserPhoto,
} from './graph-helper';
import cardholders from '../cardholders';

const domain = 'valleycollaborative.org';

const errorSchema = z.object({
    statusCode: z.number().int(),
});

export const updateAllUserPhotos = async () => {
    initializeGraph(settings);
    for (const { firstName, lastName, photoFilepath } of cardholders) {
        const email = getEmailFromName(
            firstName.toString(),
            lastName.toString()
        );
        console.log(`Cardholder: ${firstName} ${lastName}: ${email}`);
        try {
            const user = await getUserById(email);
            if (!user || user.displayName[1] !== firstName[1]) continue;

            try {
                const photo = await getUserPhoto(email);
                console.log('Photo exists:');
                console.log(photo);
            } catch (err: unknown) {
                const validatedErr = errorSchema.parse(err);
                if (validatedErr?.statusCode !== 404) {
                    console.error(err);
                    continue;
                }

                console.log('Photo does not exist. Uploading...');
                const photo = await readFile(photoFilepath);
                await updateUserPhoto(email, photo);
            }
        } catch (err: unknown) {
            console.log(
                `User ${firstName} ${lastName} does not exist. Continuing...`
            );
        }
    }
};

const initializeGraph = (settings: AppSettings) =>
    initGraphForUserAuth(settings, (info: DeviceCodeInfo) =>
        console.log(info.message)
    );

const getEmailFromName = (firstName: string, lastName: string) =>
    `${firstName[0]}${lastName}@${domain}`.replace(' ', '').toLowerCase();

// const listUsers = async () => {
//     try {
//         const userPage = await getUsers();
//         const users: User[] = userPage.value;

//         for (const user of users) {
//             console.log(`User: ${user.displayName ?? 'NO NAME'}`);
//             console.log(`  ID: ${user.id}`);
//             console.log(`  Email: ${user.mail ?? 'NO EMAIL'}`);
//         }

//         // If @odata.nextLink is not undefined, there are more users
//         // available on the server
//         const moreAvailable = userPage['@odata.nextLink'] != undefined;
//         console.log(`\nMore users available? ${moreAvailable}`);
//     } catch (err) {
//         console.log(`Error getting users: ${err}`);
//     }
// };
