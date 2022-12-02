import { delayUntil } from "./async.js";

/**
 * Simple synchronization construct to help
 * guard against unexpected behavior in asynchronous
 * applications.
 */
export class Mutex {
    #owned = false;

    /**
     * Asynchronously waits for the mutex to be free and acquires it
     * @param timeoutMs How long to wait. Default is infinite wait.
     * @returns True if the lock was acquired. False if the timeout was hit.
     */
    public async acquire(timeoutMs = Number.POSITIVE_INFINITY): Promise<boolean> {
        try {
            if (this.#owned) {
                await delayUntil(async () => !this.#owned, { timeoutMs });
            }

            this.#owned = true;
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Releases the mutex so that others can acquire it
     */
    public release() {
        if (!this.#owned) {
            throw new Error("Unbalanced release");
        }

        this.#owned = false;
    }
}
