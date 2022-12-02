/// <reference types="node" resolution-mode="require"/>
import { type SpawnOptions, type ChildProcess } from "node:child_process";
export type ChildProcessPromise = Promise<ChildProcess> & {
    ps: ChildProcess;
};
/**
 * Promisified version of Node's child_process spawn. The promise instance has
 * the ChildProcess instance embedded in a `ps` property for additional manipulation
 * before the resolution of the promise. When the process exists, the returned
 * promise will resolve with the ChildProcess instance for additional inspection
 * as well.
 */
export declare function spawn(command: string, args?: readonly string[], options?: SpawnOptions): ChildProcessPromise;
/**
 * Spawns the given executable with the given arguments and returns a promise
 * that resolves with all the text the process wrote to stdout and stderr
 * Rejects if the process couldn't be run or had a non-zero exit code.
 *
 * This API is loosely modeled on Python's subprocess.check_output
 */
export declare function spawnOutput(command: string, args?: readonly string[], options?: SpawnOptions): Promise<{
    stdout: string;
    stderr: string;
}>;
