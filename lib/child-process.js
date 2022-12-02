import { spawn as spawnRaw } from "node:child_process";
/**
 * Promisified version of Node's child_process spawn. The promise instance has
 * the ChildProcess instance embedded in a `ps` property for additional manipulation
 * before the resolution of the promise. When the process exists, the returned
 * promise will resolve with the ChildProcess instance for additional inspection
 * as well.
 */
export function spawn(command, args = [], options = {}) {
    const ps = spawnRaw(command, args, options);
    const prom = new Promise((resolve, reject) => {
        ps.on("error", (error) => {
            reject(error);
        });
        ps.on("close", (_code, _signal) => {
            resolve(ps);
        });
    });
    const cprom = prom;
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
export async function spawnOutput(command, args = [], options = {}) {
    const psPromise = spawn(command, args, { ...options, shell: true });
    const { ps } = psPromise;
    let stdout = "";
    let stderr = "";
    if (!ps.stdout || !ps.stderr) {
        throw new Error("stdout or stderr is null, so there can be no output or validation of said output");
    }
    else {
        ps.stdout.on("data", (data) => {
            stdout += data;
        });
        ps.stderr.on("data", (data) => {
            stderr += data;
        });
    }
    await psPromise;
    // eslint-disable-next-line no-negated-condition
    if (ps.exitCode !== 0) {
        throw new Error(`Exit code ${ps.exitCode}\nStdErr:\n${stderr}`);
    }
    else {
        return { stdout, stderr };
    }
}
//# sourceMappingURL=child-process.js.map