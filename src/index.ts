import { authorize, updateAllProfilePhotos } from './google';
import { doMicrosoftThings } from './microsoft';

void main();

async function main() {
    console.log('main');
    await doMicrosoftThings().then(console.log).catch(console.error);
}
