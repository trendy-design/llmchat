import { IconCodeDots, IconSpiral, IconTools } from "@tabler/icons-react"

export const ToolIcon = ({ className }: { className?: string }) => {
        return (
          <div className={`bg-yellow-800 border-yellow-900 border rounded-md p-0.5 size-5 flex items-center justify-center ${className}`}>
            <IconTools size={20} strokeWidth={2} className="text-yellow-400" />
          </div>
        )
      }
      
      export const ToolResultIcon = () => {
        return (
          <div className='bg-emerald-800 border-emerald-500/30 border rounded-md p-0.5 size-5 flex items-center justify-center'>
            <IconCodeDots size={20} strokeWidth={2} className="text-emerald-400" />
          </div>
        )
      }

      export const DeepResearchIcon = () => {
        return (
            <IconSpiral size={20} strokeWidth={2} className="text-muted-foreground" />
        )
      }