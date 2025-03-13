import { Step } from '@/libs/store/chat.store';
import { Badge } from '@repo/ui';
import { IconSearch } from '@tabler/icons-react';
import { SearchResultsList } from '../search-results';
export type StepRendererType = {
  step: Step;
}
export const StepRenderer = ({
  step
}: StepRendererType) => {

  if (step.type === 'search') {
    return <div className='flex flex-col gap-1 my-1'>
      <p className='text-sm text-muted-foreground'>Search Queries</p>
      <div className='flex flex-row gap-1 flex-wrap'>
        {step.queries?.map((query, index) => (
          <Badge key={index} className="gap-1 rounded-md px-1.5 py-1 text-xs font-normal">
            <IconSearch size={12} className="opacity-50" />
            {query}
          </Badge>
        ))}
      </div>
    </div>
  }

  if (step.type === 'read') {
    return <div className='flex flex-col gap-1 my-1'>
      <p className='text-sm text-muted-foreground'>Reading</p>
      <SearchResultsList results={step.results || []} />
    </div>
  }

  return null;
}
