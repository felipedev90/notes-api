import { describe, it, expect, vi } from "vitest";
import { catchAsync } from "./catchAsync.js";

describe("catchAsync", () => {
  it("should call next with the error when the wrapped function rejects", async () => {
    const error = new Error("boom");

    const fakeController = async () => {
      throw error;
    };

    const next = vi.fn();

    const handler = catchAsync(fakeController);
    handler({} as any, {} as any, next);

    await new Promise(process.nextTick);

    expect(next).toHaveBeenCalledWith(error);
  });
});
