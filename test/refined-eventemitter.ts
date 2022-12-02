import test from "ava";
import { createRefinedEventEmitterType } from "../src/index.js";

test("createRefinedEventEmitter", (t) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const EmitterType = createRefinedEventEmitterType<"event1" | "event2", number>();
    const emitter = new EmitterType();
    emitter.emit("event1", 32);
    emitter.on("event2", (arg: number) => {
        console.log(arg);
    });
    t.pass();
});
