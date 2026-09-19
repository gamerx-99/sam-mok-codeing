import { useRef } from "react";
import { trpc } from "@/lib/trpc";

/**
 * Fire-and-forget tool usage logging.
 * Anonymous visitors are silently skipped (protectedProcedure rejects and we
 * swallow the error) — logging is an enhancement, never a blocker.
 */
export function useToolUsageLogger() {
  const logMutation = trpc.tools.log.useMutation();
  const inflight = useRef(0);

  const logToolRun = (input: {
    toolId: string;
    toolName: string;
    toolKind: "pdf" | "interactive" | "static";
    fileCount?: number;
    fileBytes?: number;
    status: "success" | "error" | "cancelled";
    detail?: string;
  }) => {
    inflight.current += 1;
    logMutation.mutate(
      {
        toolId: input.toolId,
        toolName: input.toolName,
        toolKind: input.toolKind,
        fileCount: input.fileCount ?? 0,
        fileBytes: input.fileBytes ?? 0,
        status: input.status,
        detail: input.detail,
      },
      {
        onSettled: () => {
          inflight.current = Math.max(0, inflight.current - 1);
        },
        onError: () => undefined, // silent by design
      }
    );
  };

  return { logToolRun };
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}
