"use client";

import dynamic from "next/dynamic";
import { javascript } from "@codemirror/lang-javascript";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
});

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const extensions = [javascript({ jsx: true, typescript: true })];

export function CodeEditor({ value, onChange }: CodeEditorProps) {
  return (
    <div className="overflow-hidden rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper-raised)]">
      <CodeMirror
        value={value}
        height="420px"
        theme="dark"
        extensions={extensions}
        basicSetup
        onChange={(newValue) => onChange(newValue)}
        placeholder="Paste your source code or diff here..."
        style={{
          fontSize: "13px",
          fontFamily: "var(--font-mono)",
        }}
      />
    </div>
  );
}