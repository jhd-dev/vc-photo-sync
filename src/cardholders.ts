import { z } from 'zod';
import cardholders from './cardholders.json';

const cardholdersSchema = z
    .object({
        galaxyId: z.number().int(),
        firstName: z.string(),
        lastName: z.string(),
        photoFilepath: z.string(),
        createdAt: z.string(),
        lastUpdatedAt: z.string(),
    })
    .array();

export type Cardholder = z.infer<typeof cardholdersSchema>[number];

export default cardholdersSchema.parse(cardholders);
