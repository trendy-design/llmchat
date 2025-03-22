import { useCallback, useState } from 'react'

type CopyStatus = 'idle' | 'copied' | 'error'

export const useCopyText = () => {
  const [status, setStatus] = useState<CopyStatus>('idle')

  const copyToClipboard = useCallback(async (element: HTMLElement) => {
    try {
      const range = document.createRange()
      const selection = window.getSelection()
      
      if (!selection) {
        throw new Error('No selection object available')
      }

      selection.removeAllRanges()
      range.selectNodeContents(element)
      selection.addRange(range)
      
      document.execCommand('copy')
      selection.removeAllRanges()
      
      setStatus('copied')
      setTimeout(() => setStatus('idle'), 2000)
      
      return true
    } catch (err) {
      setStatus('error')
      return false
    }
  }, [])

  return {
    status,
    copyToClipboard
  }
}