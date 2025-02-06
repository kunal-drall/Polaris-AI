import { useState } from "react"
import { FiCopy, FiCheck } from "react-icons/fi"

interface CodeSnippetProps {
  title: string
  code: string
}

export default function CodeSnippet({ title, code }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000) // Reset copy state after 2s
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-6 relative">
      {/* 🔹 Code Title */}
      <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{title}</h3>

      {/* 🔹 Code Block with Syntax Highlighting */}
      <div className="relative">
        <pre className="bg-gray-200 dark:bg-gray-700 p-4 rounded-md overflow-x-auto text-sm text-gray-900 dark:text-gray-300">
          <code>{code}</code>
        </pre>

        {/* 🔹 Copy Button */}
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 bg-gray-300 dark:bg-gray-600 rounded-md text-gray-800 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-500 transition"
          aria-label="Copy Code"
        >
          {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
        </button>
      </div>
    </div>
  )
}
