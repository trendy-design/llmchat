import { Block } from '@/libs/store/chat.store';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button } from '@repo/ui';
import { IconLoader2, IconStack2 } from '@tabler/icons-react';
import { Fragment, useState } from 'react';
import { CitationProvider } from './citation-provider';
import { ThreadBlockMetadata } from './node-meta';
import { SearchStep } from './search-step';
import { StepStatus } from './step-status';
import { AIThreadItemV2 } from './thread-item';
import { VaulDrawer } from './vaul-drawer';

export const Steps = ({ steps }: { steps: Block[] }) => {
  const [debugMode, setDebugMode] = useState(false);

  if(steps.length === 0) {
    return null;
  }

  const isLoading = steps.some(step => step.nodeStatus === 'pending');
  return (
    <>
    {/* <Button variant="bordered" size="xs" className="p-0" onClick={() => setDebugMode(!debugMode)}>
      {debugMode ? 'Hide Workflow' : 'Show Workflow'}
    </Button> */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="workflow" className="rounded-lg overflow-hidden border border-border bg-secondary/50 p-0">
          <AccordionTrigger className="flex flex-row items-center bg-secondary gap-2 py-3 px-4">
            <div className="flex flex-row items-center gap-2">
              {isLoading ? <IconLoader2 size={16} className='text-brand animate-spin' /> : <IconStack2 size={16} className='text-brand' />}
              <p className="text-sm font-medium">Workflow</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0 bg-background/50">
            <div className="flex flex-col p-2 py-4 pr-8 w-full overflow-hidden">
              {(steps || []).map((block, index, array) => (
                <div className="flex flex-row items-stretch justify-start gap-2 w-full" key={index}>
                  <div className="flex min-h-full flex-col items-center justify-start px-2">
                    <div className="bg-border/50 h-1.5 shrink-0" />
                    <div className="z-10 bg-secondary">
                      <StepStatus status={block.nodeStatus} />
                    </div>
                    <div className="bg-border/50 min-h-full w-[1px] flex-1" />
                  </div>
                  <div className="flex flex-col pb-4 w-full flex-1 overflow-hidden">
                 
                      <Fragment>
                        {block.nodeReasoning ? (
                          <AIThreadItemV2 content={block.nodeReasoning} key={index} className='!prose-sm' />
                        ) : null}
                        {block.object && JSON.stringify(block.object)}
                        <SearchStep
                          toolCalls={block.toolCalls || []}
                          toolCallResults={block.toolCallResults || []}
                        />
                        {(
                          <div className="flex flex-row gap-2">
                            <VaulDrawer
                              renderContent={() => (
                                <CitationProvider block={block}>

                              <AIThreadItemV2 content={block.content} key={index}/>
                               </CitationProvider>
                              )}
                            >
                              <Button variant="link" size="xs" className="p-0">
                                Read more
                              </Button>
                            </VaulDrawer>
                            <VaulDrawer renderContent={() => <ThreadBlockMetadata block={block} />}>
                              <Button variant="link" size="xs" className="p-0">
                                More details
                              </Button>
                            </VaulDrawer>
                          </div>
                        )}
                      </Fragment>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};
