import { updateAllUserPhotos } from './microsoft';

void main();

async function main() {
    await updateAllUserPhotos().then(console.log).catch(console.error);
}
