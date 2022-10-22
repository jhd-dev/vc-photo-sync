import { rename } from 'fs/promises';
import cardholders from './cardholders';

/**
 * Copies images to another folder an renames them based on the cardholder's first and last names.
 */
export const renameImages = async () => {
    for (const { firstName, lastName, photoFilepath } of cardholders) {
        const oldPath = photoFilepath.replace('Photos\\', 'AdpPhotos\\');
        const newPath = oldPath.replace(
            /[0-9]*\.jpg/gim,
            `${firstName}_${lastName}.jpg`
        );
        try {
            await rename(oldPath, newPath);
            console.log(newPath);
        } catch (err: unknown) {
            console.error(err);
        }
    }
};
