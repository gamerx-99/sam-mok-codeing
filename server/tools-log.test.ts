import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("tool usage router & validation", () => {
  it("validates that toolId cannot exceed 80 chars", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller.tools.log({
        toolId: "a".repeat(81),
        toolName: "Test Tool",
        toolKind: "static",
        fileCount: 1,
        fileBytes: 100,
        status: "success",
      })
    ).rejects.toThrow();
  });

  it("validates that fileCount cannot exceed 200", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller.tools.log({
        toolId: "test-tool",
        toolName: "Test Tool",
        toolKind: "static",
        fileCount: 201,
        fileBytes: 100,
        status: "success",
      })
    ).rejects.toThrow();
  });

  it("rejects unauthorized access to tools.list from anonymous users", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    await expect(caller.tools.list()).rejects.toThrow();
  });
});
