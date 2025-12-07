import React from 'react'
export default function Spinner(){
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center p-4">
      <div className="w-8 h-8 rounded-full animate-spin border-4 border-white/20 border-t-white"></div>
    </div>
  )
}
