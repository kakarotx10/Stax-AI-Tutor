'use client'

import Editor, { type EditorProps } from '@monaco-editor/react'

const editorLoading = (
  <div className="h-full min-h-64 w-full animate-pulse rounded-lg bg-card" />
)

export default function MonacoEditor(props: EditorProps) {
  return <Editor loading={editorLoading} {...props} />
}
