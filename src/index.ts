import cardholders from './cardholders';
import { updateFreshdeskPhotos } from './freshdesk';
import {
    authorize as authorizeGoogle,
    updateAllProfilePhotos as updateGooglePhotos,
} from './google';
import { updateAllUserPhotos as updateMicrosoftPhotos } from './microsoft';

const main = async (): Promise<void> => {
    try {
        const googleAuth = await authorizeGoogle();
        await updateGooglePhotos(googleAuth);
        await updateFreshdeskPhotos(cardholders);
        await updateMicrosoftPhotos();
    } catch (err: unknown) {
        console.error(err);
    }
};

void main();
