import cardholders from './cardholders';

export const getCardholders = async () =>
    cardholders.map(
        ({
            galaxyId,
            firstName,
            lastName,
            photoFilepath,
            createdAt,
            lastUpdatedAt,
        }) => ({
            galaxyId:
                typeof galaxyId === 'string' ? parseInt(galaxyId) : galaxyId,
            firstName: String(firstName),
            lastName: String(lastName),
            photoFilepath: String(photoFilepath),
            createdAt: new Date(createdAt),
            lastUpdatedAt: new Date(lastUpdatedAt),
        })
    );
