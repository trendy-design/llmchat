import { Block } from '@/libs/store/chat.store';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button } from '@repo/ui';
import { IconStack2 } from '@tabler/icons-react';
import { Fragment, useState } from 'react';
import { ThreadBlockMetadata } from './node-meta';
import { SearchAndReadingResults } from './search-results';
import { StepStatus } from './step-status';
import { AIThreadItem } from './thread-item';
import { VaulDrawer } from './vaul-drawer';

export const Steps = ({ steps }: { steps: Block[] }) => {
  const [debugMode, setDebugMode] = useState(false);
  return (
    <>
      {/* <Button variant="link" size="xs" className="p-0" onClick={() => setDebugMode(!debugMode)}>
        Debug Mode
      </Button> */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="workflow" className="rounded-xl overflow-hidden border border-border bg-secondary/50 p-0">
          <AccordionTrigger className="flex flex-row items-center bg-secondary gap-2 py-3 px-4">
            <div className="flex flex-row items-center gap-2">
              <IconStack2 size={16} className='text-brand' />
              <p className="text-sm font-medium">Workflow</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0 bg-secondary/50">
            <div className="flex flex-col p-2 py-4 pr-8 w-full">
              {(steps || []).map((block, index, array) => (
                <div className="flex flex-row items-stretch justify-start gap-2" key={index}>
                  <div className="flex min-h-full flex-col items-center justify-start px-2">
                    <div className="bg-border/50 h-1.5 shrink-0" />
                    <div className="z-10">
                      <StepStatus status={block.nodeStatus} />
                    </div>
                    <div className="bg-border/50 min-h-full w-[1px] flex-1" />
                  </div>
                  <div className="flex flex-col pb-4 w-full">
                 
                    <div className='py-1'>
                      <Fragment>
                        {block.nodeReasoning ? (
                          <p className="text-sm text-muted-foreground leading-relaxed">{block.nodeReasoning}</p>
                        ) : null}
                        <SearchAndReadingResults
                          toolCalls={block.toolCalls || []}
                          toolCallResults={block.toolCallResults || []}
                        />
                        {debugMode && (
                          <div className="flex flex-row gap-2">
                            <VaulDrawer
                              renderContent={() => <AIThreadItem content={block.content} key={index} />}
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
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};
