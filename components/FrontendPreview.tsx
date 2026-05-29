'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Code, RefreshCw } from 'lucide-react'

interface FrontendPreviewProps {
  html?: string
  css?: string
  javascript?: string
  react?: string
  language: string
}

export default function FrontendPreview({ html, css, javascript, react, language }: FrontendPreviewProps) {
  const [iframeKey, setIframeKey] = useState(0)
  const [previewHtml, setPreviewHtml] = useState('')

  useEffect(() => {
    let fullHtml = ''

    if (language === 'react' && react) {
      // For React, we'll use a simple React runtime (CDN)
      fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Preview</title>
  <style>
    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
    ${css || ''}
  </style>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${react}
  </script>
</body>
</html>
      `
    } else {
      // For HTML/CSS/JS
      fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
    ${css || ''}
  </style>
</head>
<body>
  ${html || ''}
  <script>
    ${javascript || ''}
  </script>
</body>
</html>
      `
    }

    setPreviewHtml(fullHtml)
  }, [html, css, javascript, react, language])

  const refreshPreview = () => {
    setIframeKey(prev => prev + 1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold text-primary">Live Preview</h3>
        </div>
        <button
          onClick={refreshPreview}
          className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
      
      <div className="border border-primary/30 rounded-lg overflow-hidden bg-white">
        <iframe
          key={iframeKey}
          srcDoc={previewHtml}
          className="w-full h-96"
          sandbox="allow-scripts allow-same-origin"
          title="Code Preview"
        />
      </div>
    </motion.div>
  )
}



