/**
 * Resolves after a specified amount of time.
 *
 * @param time number of milliseconds to wait
 */
export const delay = (time: number) =>
    new Promise((resolve) => setTimeout(resolve, time));
