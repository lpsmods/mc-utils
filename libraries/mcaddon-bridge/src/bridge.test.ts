import { describe, expect, it } from "vitest";
import { Bridge } from "./bridge";
import { world } from "@minecraft/server";

describe("Bridge", () => {
  it("Create api bridge.", () => {
    const api = new Bridge("test");

    // Basic property
    api.defineProperty("integer", { value: 1 });
    api.defineProperty("float", { value: 0.5 });
    api.defineProperty("string", { value: "Hello, World!" });
    api.defineProperty("boolean", { value: true });

    api.defineProperty("name", {
      value: "Steve2",
      writeable: true,
      enumerable: true,
      configurable: true,
    });

    // Getter and Setter
    api.defineProperty("fullName", {
      get() {
        const firstName = world.getDynamicProperty("first_name");
        const lastName = world.getDynamicProperty("last_name");
        return `${firstName} ${lastName}`;
      },

      set(value) {
        const parts = value.split(" ");
        world.setDynamicProperty("first_name", parts[0]);
        world.setDynamicProperty("last_name", parts[1]);
      },
      enumerable: true,
      configurable: true,
    });

    // Simple function property
    api.defineProperty("greet", {
      value: function (name: string) {
        console.warn(`Hello, ${name}!`);
      },
      writeable: true,
      enumerable: true,
      configurable: true,
    });
    api.defineProperty("mul", {
      value: function (num1: number, num2: number) {
        return num1 * num2;
      },
    });

    expect(true).toBe(true);
  });
});
