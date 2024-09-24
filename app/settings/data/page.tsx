"use client";
import { SettingCard } from "@/components/settings/setting-card";
import { SettingsContainer } from "@/components/settings/settings-container";
import { defaultPreferences } from "@/config";
import { usePreferenceContext, useSessions } from "@/lib/context";
import { exportService } from "@/lib/services/export/client";
import { generateAndDownloadJson } from "@/lib/utils/utils";
import { getPGClient } from "@/libs/database/client";
import {
  Button,
  Flex,
  Input,
  PopOverConfirmProvider,
  Type,
  useToast,
} from "@/ui";
import { PGliteInterface } from "@electric-sql/pglite";
import { Repl } from "@electric-sql/pglite-repl";
import { PGliteWorker } from "@electric-sql/pglite/worker";
import { FileDown, FileUp, Paperclip } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";

export default function DataSettings() {
  const { toast } = useToast();

  const [db, setDb] = useState<PGliteWorker | null>(null);
  const initDb = async () => {
    const db = await getPGClient();
    setDb(db);
  };

  useEffect(() => {
    initDb();
  }, []);

  const { clearSessionsMutation, createSession } = useSessions();

  const { updatePreferences } = usePreferenceContext();

  function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = async function (e) {
        const content = e.target?.result as string;
        try {
          exportService.processImport(content);

          toast({
            title: "Data Imported",
            description: "The JSON file you uploaded has been imported",
            variant: "default",
          });
          // window.location.reload();
        } catch (e) {
          // Log this error
          toast({
            title: "Invalid JSON",
            description: "The JSON file you uploaded is invalid",
            variant: "destructive",
          });
          return;
        }
      };
      reader.readAsText(file);
    }
  }

  return (
    <Flex direction="col" gap="xl" className="w-full">
      <SettingsContainer title="Manage your Data">
        <Flex direction="col" gap="md" className="w-full">
          <SettingCard className="py-5">
            <Flex items="center" justify="between">
              <Type textColor="primary" weight="medium">
                Clear Chat History
              </Type>
              <PopOverConfirmProvider
                title="Are you sure you want to clear entire chat history? This action cannot be undone."
                confimBtnText="Clear"
                onConfirm={() => {
                  clearSessionsMutation.mutate(undefined, {
                    onSuccess: () => {
                      toast({
                        title: "Data Cleared",
                        description: "All chat data has been cleared",
                        variant: "default",
                      });
                      createSession();
                    },
                  });
                }}
              >
                <Button variant="destructive" size="sm">
                  Clear
                </Button>
              </PopOverConfirmProvider>
            </Flex>
            <div className="my-4 h-[1px] w-full bg-zinc-500/10" />
            <Flex items="center" justify="between">
              <Type textColor="primary" weight="medium">
                Reset Preferences
              </Type>
              <PopOverConfirmProvider
                title="Are you sure you want to reset all preferences? This action cannot be undone."
                confimBtnText="Reset All"
                onConfirm={(dismiss) => {
                  updatePreferences(defaultPreferences);
                  toast({
                    title: "Reset successful",
                    description: "All preferences have been reset",
                    variant: "default",
                  });
                }}
              >
                <Button variant="destructive" size="sm">
                  Reset All
                </Button>
              </PopOverConfirmProvider>
            </Flex>
          </SettingCard>

          <SettingCard className="py-5">
            <Flex items="center" justify="between">
              <Flex direction="col">
                <Type textColor="primary" weight="medium">
                  Import Data
                </Type>
                <Type textColor="secondary" size="xs">
                  Import your chat data from a JSON file
                </Type>
              </Flex>
              <Input
                type="file"
                onChange={handleFileSelect}
                hidden
                className="invisible w-0"
                id="import-config"
              />
              <PopOverConfirmProvider
                title="This action will overwrite your current data. Are you sure you want to import?"
                confimBtnText="Import Data"
                confimBtnVariant="default"
                confirmIcon={Paperclip}
                onConfirm={(dismiss) => {
                  document?.getElementById("import-config")?.click();
                  dismiss();
                }}
              >
                <Button variant="outlined" size="sm">
                  <FileDown size={16} strokeWidth={2} /> Import
                </Button>
              </PopOverConfirmProvider>
            </Flex>
            <div className="my-4 h-[1px] w-full bg-zinc-500/10" />

            <Flex items="center" justify="between" className="w-full">
              <Flex direction="col">
                <Type textColor="primary" weight="medium">
                  Export Data
                </Type>
                <Type textColor="secondary" size="xs">
                  Export your chat data to a JSON file
                </Type>
              </Flex>
              <Button
                variant="outlined"
                size="sm"
                onClick={() => {
                  exportService.processExport().then((data) => {
                    generateAndDownloadJson(data, "llmchat.json");
                  });
                }}
              >
                <FileUp size={16} strokeWidth={2} /> Export
              </Button>
            </Flex>
          </SettingCard>
        </Flex>
      </SettingsContainer>
      <SettingsContainer title="Query your Data">
        {db && (
          <div className="h-[300px] w-full overflow-hidden rounded-lg border border-zinc-500/20 text-base">
            <Repl showTime pg={db as PGliteInterface} theme="auto" />
          </div>
        )}
      </SettingsContainer>
    </Flex>
  );
}
