"use client";

import { useRef, useState } from "react";

type CodexThreadLauncherProps = {
  chatName?: string;
  copyPromptLabel?: string;
  description?: string;
  mainThreadHref?: string;
  prompt: string;
  promptLabel?: string;
  threadHref: string;
};

type CopyState = "idle" | "copying" | "copied" | "manual";

export function CodexThreadLauncher({
  chatName = "Template maker chat",
  copyPromptLabel = "Copy prompt",
  description,
  mainThreadHref,
  prompt,
  promptLabel = "Chat prompt",
  threadHref
}: CodexThreadLauncherProps) {
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const threadRef = useRef<HTMLInputElement>(null);
  const [promptCopyState, setPromptCopyState] = useState<CopyState>("idle");
  const [threadCopyState, setThreadCopyState] = useState<CopyState>("idle");

  async function copyText({
    text,
    selectTarget,
    setCopyState
  }: {
    text: string;
    selectTarget: () => void;
    setCopyState: (state: CopyState) => void;
  }) {
    selectTarget();
    setCopyState("copying");

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard is unavailable.");
      }

      await Promise.race([
        navigator.clipboard.writeText(text),
        new Promise((_, reject) => {
          window.setTimeout(() => reject(new Error("Clipboard timed out.")), 800);
        })
      ]);
      setCopyState("copied");
    } catch {
      setCopyState("manual");
    }
  }

  return (
    <div className="soft-card grid gap-5 p-5 sm:p-6">
      <div>
        <h2 className="text-2xl font-semibold">{chatName}</h2>
        <p className="mt-2 text-sm leading-6 text-charcoal-soft">
          {description ??
            "This is the focused workspace for this part of Printili. Keep it linked to the main project chat so the website stays organized."}
        </p>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-charcoal">
        {promptLabel}
        <textarea
          className="focus-ring min-h-72 resize-y rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 py-3 font-mono text-xs font-normal leading-5 text-charcoal"
          onFocus={(event) => event.currentTarget.select()}
          readOnly
          ref={promptRef}
          value={prompt}
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="focus-ring min-h-11 rounded-full bg-charcoal px-5 text-sm font-semibold text-paper"
          onClick={() =>
            copyText({
              text: prompt,
              selectTarget: () => promptRef.current?.select(),
              setCopyState: setPromptCopyState
            })
          }
          type="button"
        >
          {copyPromptLabel}
        </button>
        {promptCopyState === "copied" ? (
          <p className="text-sm font-semibold text-rose">Prompt copied.</p>
        ) : null}
        {promptCopyState === "copying" ? (
          <p className="text-sm font-semibold text-rose">Copying...</p>
        ) : null}
        {promptCopyState === "manual" ? (
          <p className="text-sm font-semibold text-rose">Prompt is selected. Press Ctrl+C.</p>
        ) : null}
      </div>

      <div className="border-t border-[rgb(199_163_95_/_0.18)] pt-5">
        <p className="text-sm font-semibold text-charcoal">Saved chat links</p>
        <p className="mt-1 text-sm leading-6 text-charcoal-soft">
          Codex app links can be copied here. If a link does not open, start a new chat and paste
          the prompt above.
        </p>
      </div>

      {mainThreadHref ? (
        <label className="grid gap-2 text-sm font-semibold text-charcoal">
          Main control chat
          <input
            className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-normal text-charcoal"
            onFocus={(event) => event.currentTarget.select()}
            readOnly
            value={mainThreadHref}
          />
        </label>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          aria-label={`${chatName} thread link`}
          className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm text-charcoal"
          onFocus={(event) => event.currentTarget.select()}
          readOnly
          ref={threadRef}
          value={threadHref}
        />
        <button
          className="focus-ring min-h-11 rounded-full border border-charcoal px-5 text-sm font-semibold text-charcoal"
          onClick={() =>
            copyText({
              text: threadHref,
              selectTarget: () => threadRef.current?.select(),
              setCopyState: setThreadCopyState
            })
          }
          type="button"
        >
          Copy chat link
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {threadCopyState === "copied" ? (
          <p className="text-sm font-semibold text-rose">Chat link copied.</p>
        ) : null}
        {threadCopyState === "copying" ? (
          <p className="text-sm font-semibold text-rose">Copying...</p>
        ) : null}
        {threadCopyState === "manual" ? (
          <p className="text-sm font-semibold text-rose">Chat link is selected. Press Ctrl+C.</p>
        ) : null}
      </div>
    </div>
  );
}
