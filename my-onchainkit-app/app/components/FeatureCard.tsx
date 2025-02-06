import type { ReactNode } from "react"
import { motion } from "framer-motion"

interface FeatureCardProps {
  title: string
  description: string
  icon?: ReactNode
}

export default function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 🔹 Feature Icon */}
      {icon && (
        <div className="text-blue-500 mb-4" aria-hidden="true">
          {icon}
        </div>
      )}

      {/* 🔹 Feature Title */}
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>

      {/* 🔹 Feature Description */}
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </motion.div>
  )
}
