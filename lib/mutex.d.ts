/**
 * Simple synchronization construct to help
 * guard against unexpected behavior in asynchronous
 * applications.
 */
export declare class Mutex {
    #private;
    /**
     * Asynchronously waits for the mutex to be free and acquires it
     * @param timeoutMs How long to wait. Default is infinite wait.
     * @returns True if the lock was acquired. False if the timeout was hit.
     */
    acquire(timeoutMs?: number): Promise<boolean>;
    /**
     * Releases the mutex so that others can acquire it
     */
    release(): void;
}
