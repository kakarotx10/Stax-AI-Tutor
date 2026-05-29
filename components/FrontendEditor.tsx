'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Code, RefreshCw, Maximize2, Minimize2, FileCode, Palette, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { saveUserAttempt, saveUserProgress } from '@/lib/userAttempts'
import MonacoEditor from './MonacoEditor'

interface FrontendEditorProps {
  subject: string
  unit: string
  subtopic: string
  subjectId?: string
  unitId?: string
  subtopicId?: string
  phase?: string
  difficulty?: 'Basic' | 'Medium' | 'Advanced'
  question?: {
    title: string
    description: string
    requirements: string[]
    starterCode?: {
      html?: string
      css?: string
      javascript?: string
      react?: string
    }
    hints: string[]
  }
  onComplete?: () => void
}

type EditorTab = 'html' | 'css' | 'javascript' | 'react'
type ViewMode = 'split' | 'preview' | 'code'

export default function FrontendEditor({
  subject,
  unit,
  subtopic,
  subjectId,
  unitId,
  subtopicId,
  phase,
  difficulty = 'Basic',
  question,
  onComplete
}: FrontendEditorProps) {
  const [htmlCode, setHtmlCode] = useState(question?.starterCode?.html || '')
  const [cssCode, setCssCode] = useState(question?.starterCode?.css || '')
  const [jsCode, setJsCode] = useState(question?.starterCode?.javascript || '')
  const [reactCode, setReactCode] = useState(question?.starterCode?.react || '')
  const [activeTab, setActiveTab] = useState<EditorTab>('html')
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [previewKey, setPreviewKey] = useState(0)
  const [showHints, setShowHints] = useState(false)
  const [completed, setCompleted] = useState(false)

  // Determine which editors to show based on subject
  const isReact = subject.toLowerCase() === 'react'
  const isTypeScript = subject.toLowerCase() === 'typescript'
  const showReactEditor = isReact || isTypeScript

  const tabs: EditorTab[] = showReactEditor 
    ? ['html', 'css', 'react']
    : ['html', 'css', 'javascript']

  useEffect(() => {
    // Set initial code based on question
    if (question?.starterCode) {
      if (question.starterCode.html) setHtmlCode(question.starterCode.html)
      if (question.starterCode.css) setCssCode(question.starterCode.css)
      if (question.starterCode.javascript) setJsCode(question.starterCode.javascript)
      if (question.starterCode.react) setReactCode(question.starterCode.react)
    }
  }, [question])

  const refreshPreview = () => {
    setPreviewKey(prev => prev + 1)
    toast.success('Preview refreshed!')
  }

  const generatePreviewHtml = () => {
    if (showReactEditor && reactCode) {
      return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Preview</title>
  <style>
    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
    ${cssCode || ''}
  </style>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${reactCode}
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(App));
  </script>
</body>
</html>
      `
    } else {
      return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
    ${cssCode || ''}
  </style>
</head>
<body>
  ${htmlCode || ''}
  <script>
    ${jsCode || ''}
  </script>
</body>
</html>
      `
    }
  }

  const handleRun = () => {
    // For now, just refresh preview
    // In future, can add validation against expected output
    refreshPreview()
    toast.success('Code executed! Check the preview.')
  }

  const handleSubmit = async () => {
    if (!htmlCode.trim() && !reactCode.trim()) {
      toast.error('Please write some code first')
      return
    }

    const files = {
      html: htmlCode,
      css: cssCode,
      javascript: jsCode,
      react: reactCode,
    }

    await saveUserAttempt({
      type: 'assignment',
      subjectId,
      subjectName: subject,
      unitId,
      unitName: unit,
      subtopicId,
      subtopicName: subtopic,
      phase: phase ?? 'assignment',
      difficulty,
      problemTitle: question?.title ?? `${subject} frontend challenge`,
      prompt: question?.description,
      language: showReactEditor ? 'react' : 'html/css/javascript',
      code: JSON.stringify(files, null, 2),
      status: 'completed',
      score: 100,
      passedCount: 1,
      totalCount: 1,
      metadata: {
        category: 'frontend',
        requirements: question?.requirements ?? [],
      },
    })

    await saveUserProgress({
      subjectId,
      unitId,
      subtopicId,
      phase: phase ?? 'assignment',
      codingScore: 100,
    })

    // For now, mark as completed
    // In future, can add actual validation
    setCompleted(true)
    toast.success('Great job! Challenge completed! 🎉')
    if (onComplete) {
      setTimeout(() => onComplete(), 1000)
    }
  }

  const getLanguageForTab = (tab: EditorTab): string => {
    switch (tab) {
      case 'html': return 'html'
      case 'css': return 'css'
      case 'javascript': return 'javascript'
      case 'react': return 'javascript'
      default: return 'javascript'
    }
  }

  const getCodeForTab = (tab: EditorTab): string => {
    switch (tab) {
      case 'html': return htmlCode
      case 'css': return cssCode
      case 'javascript': return jsCode
      case 'react': return reactCode
      default: return ''
    }
  }

  const setCodeForTab = (tab: EditorTab, value: string) => {
    switch (tab) {
      case 'html': setHtmlCode(value); break
      case 'css': setCssCode(value); break
      case 'javascript': setJsCode(value); break
      case 'react': setReactCode(value); break
    }
  }

  return (
    <div className="space-y-6">
      {/* Question Header */}
      {question && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-2">{question.title}</h2>
              <p className="text-foreground/80 mb-4">{question.description}</p>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-accent">Requirements:</h3>
                <ul className="list-disc list-inside space-y-1 text-foreground/80">
                  {question.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                difficulty === 'Basic' ? 'bg-green-500/20 text-green-400' :
                difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {difficulty}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowHints(!showHints)}
            className="text-sm text-primary hover:text-accent transition-colors"
          >
            {showHints ? 'Hide' : 'Show'} Hints
          </button>
          {showHints && question.hints.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg"
            >
              <h4 className="font-semibold text-primary mb-2">Hints:</h4>
              <ul className="list-disc list-inside space-y-1 text-foreground/80">
                {question.hints.map((hint, idx) => (
                  <li key={idx}>{hint}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('code')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'code' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            <Code className="w-4 h-4 inline mr-2" />
            Code
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'split' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            Split
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'preview' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            <Monitor className="w-4 h-4 inline mr-2" />
            Preview
          </button>
        </div>
        <button
          onClick={refreshPreview}
          className="px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Preview
        </button>
      </div>

      {/* Editor and Preview Container */}
      <div className="grid gap-6" style={{
        gridTemplateColumns: viewMode === 'code' ? '1fr' : viewMode === 'preview' ? '1fr' : '1fr 1fr'
      }}>
        {/* Code Editor Section */}
        {(viewMode === 'code' || viewMode === 'split') && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-4"
          >
            {/* Editor Tabs */}
            <div className="flex items-center gap-2 mb-4 border-b border-border">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 flex items-center gap-2 transition-all border-b-2 ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'html' && <FileCode className="w-4 h-4" />}
                  {tab === 'css' && <Palette className="w-4 h-4" />}
                  {(tab === 'javascript' || tab === 'react') && <Zap className="w-4 h-4" />}
                  <span className="capitalize">{tab === 'javascript' ? 'JS' : tab.toUpperCase()}</span>
                </button>
              ))}
            </div>

            {/* Monaco Editor */}
            <div className="border border-primary/30 rounded-lg overflow-hidden">
              <MonacoEditor
                height="500px"
                language={getLanguageForTab(activeTab)}
                value={getCodeForTab(activeTab)}
                onChange={(value) => setCodeForTab(activeTab, value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Preview Section */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold text-primary">Live Preview</h3>
              </div>
            </div>
            
            <div className="border border-primary/30 rounded-lg overflow-hidden bg-white">
              <iframe
                key={previewKey}
                srcDoc={generatePreviewHtml()}
                className="w-full h-[500px]"
                sandbox="allow-scripts allow-same-origin"
                title="Code Preview"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4">
        <button
          onClick={handleRun}
          className="px-6 py-3 bg-accent hover:bg-accent/80 text-foreground rounded-lg font-semibold transition-all flex items-center gap-2"
        >
          <Zap className="w-5 h-5" />
          Run Code
        </button>
        {!completed && (
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg font-semibold transition-all"
          >
            Submit Solution
          </button>
        )}
        {completed && (
          <div className="px-6 py-3 bg-success text-primary-foreground rounded-lg font-semibold">
            ✓ Completed!
          </div>
        )}
      </div>
    </div>
  )
}



