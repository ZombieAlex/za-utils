import test from "ava";
import { spawn, spawnOutput } from "../src/index.js";

test("spawnOutput returns all output", async (t) => {
    const expectedOut = "Hello world!";
    const expectedError = "Goodbye!";
    const { stdout, stderr } = await spawnOutput("node", [
        `--eval="process.stdout.write('${expectedOut}'); process.stderr.write('${expectedError}');"`,
    ]);
    t.is(stdout, expectedOut);
    t.is(stderr, expectedError);
});

test("spawn embeds the ChildProcess as .ps", async (t) => {
    const psPromise = spawn("node", [`--eval="process.exit(36);"`], { shell: true });
    const { ps } = psPromise;
    t.assert(typeof ps === "object");
    t.assert(ps === (await psPromise));
    t.is(ps.exitCode, 36);
});

test("spawnOutput throws when the process exitcode is non-zero", async (t) => {
    await t.throwsAsync(spawnOutput("node", [`--eval="process.exit(-1);"`]));
});

test("spawn throws when the process does not exist", async (t) => {
    await t.throwsAsync(spawn("this process does not exist"));
});

test("spawnOutput throws when options lead to null stdout or stderr", async (t) => {
    await t.throwsAsync(spawnOutput("node", [`--eval="process.exit(0);"`], { stdio: ["ignore", "ignore", "ignore"] }));
});
