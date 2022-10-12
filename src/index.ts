import { authorize, updateAllProfilePhotos } from './google';

void main();

async function main() {
    console.log('main');
    await authorize().then(updateAllProfilePhotos).catch(console.error);
}
