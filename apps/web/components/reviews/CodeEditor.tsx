"use client";

import dynamic from "next/dynamic";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

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
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
      <CodeMirror
        value={value}
        height="420px"
        theme={oneDark}
        extensions={extensions}
        basicSetup
        onChange={(newValue) => onChange(newValue)}
        placeholder="Paste your code here..."
        style={{
          fontSize: "14px",
        }}
      />
    </div>
  );
}