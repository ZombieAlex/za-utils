import { spawn as spawnRaw, type SpawnOptions, type ChildProcess } from "node:child_process";

export type ChildProcessPromise = Promise<ChildProcess> & { ps: ChildProcess };

/**
 * Promisified version of Node's child_process spawn. The promise instance has
 * the ChildProcess instance embedded in a `ps` property for additional manipulation
 * before the resolution of the promise. When the process exists, the returned
 * promise will resolve with the ChildProcess instance for additional inspection
 * as well.
 */
export function spawn(command: string, args: readonly string[] = [], options: SpawnOptions = {}): ChildProcessPromise {
    const ps = spawnRaw(command, args, options);
    const prom = new Promise<ChildProcess>((resolve, reject) => {
        ps.on("error", (error) => {
            reject(error);
        });
        ps.on("close", (_code, _signal) => {
            resolve(ps);
        });
    });

    const cprom = prom as ChildProcessPromise;
    cprom.ps = ps;
    return cprom;
}

/**
 * Spawns the given executable with the given arguments and returns a promise
 * that resolves with all the text the process wrote to stdout and stderr
 * Rejects if the process couldn't be run or had a non-zero exit code.
 *
 * This API is loosely modeled on Python's subprocess.check_output
 */
export async function spawnOutput(
    command: string,
    args: readonly string[] = [],
    options: SpawnOptions = {},
): Promise<{ stdout: string; stderr: string }> {
    const psPromise = spawn(command, args, { ...options, shell: true });
    const { ps } = psPromise;

    let stdout = "";
    let stderr = "";
    if (!ps.stdout || !ps.stderr) {
        throw new Error("stdout or stderr is null, so there can be no output or validation of said output");
    } else {
        ps.stdout.on("data", (data: string) => {
            stdout += data;
        });
        ps.stderr.on("data", (data: string) => {
            stderr += data;
        });
    }

    await psPromise;

    if (ps.exitCode! === 0) {
        return { stdout, stderr };
    }

    throw new Error(`Exit code ${ps.exitCode!}\nStdErr:\n${stderr}`);
}
