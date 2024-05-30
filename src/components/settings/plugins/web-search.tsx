import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useModelSettings } from "@/hooks/use-model-settings";
import { ArrowRight, Info } from "@phosphor-icons/react";
import axios from "axios";
import { SettingsContainer } from "../settings-container";

export const WebSearchPlugin = () => {
  const { toast } = useToast();
  const { formik, setPreferences } = useModelSettings({});

  const handleRunTest = async () => {
    try {
      const url = "https://www.googleapis.com/customsearch/v1";
      const params = {
        key: formik.values.googleSearchApiKey,
        cx: formik.values.googleSearchEngineId,
        q: "Latest news",
      };

      const response = await axios.get(url, { params });

      if (response.status === 200) {
        toast({
          title: "Test successful",
          description: "Google search plugin is working",
          variant: "default",
        });
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      toast({
        title: "Test failed",
        description: "Google search plugin is not working",
        variant: "destructive",
      });
    }
  };
  return (
    <SettingsContainer title="Web search plugin">
      <div className="flex flex-col w-full items-start gap-2">
        <div className="flex flex-col w-full">
          <div className="flex flex-row items-center justify-between py-2 w-full">
            <p className="flex flex-row text-sm md:text-base items-center gap-1  text-zinc-500">
              Google Search Engine ID <Info weight="regular" size={14} />
            </p>
          </div>

          <Input
            name="googleSearchEngineId"
            type="text"
            value={formik.values.googleSearchEngineId}
            autoComplete="off"
            onChange={(e) => {
              setPreferences({ googleSearchEngineId: e.target.value });
              formik.setFieldValue("googleSearchEngineId", e.target.value);
            }}
          />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex flex-row items-center justify-between py-2 w-full">
            <p className="flex flex-row text-sm md:text-base items-center gap-1  text-zinc-500">
              Google Search Api Key <Info weight="regular" size={14} />
            </p>
          </div>

          <Input
            name="googleSearchApiKey"
            type="text"
            value={formik.values.googleSearchApiKey}
            autoComplete="off"
            onChange={(e) => {
              setPreferences({ googleSearchApiKey: e.target.value });
              formik.setFieldValue("googleSearchApiKey", e.target.value);
            }}
          />
        </div>
        <Button onClick={handleRunTest} size="sm">
          Run check
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            window.open(
              "https://programmablesearchengine.google.com/controlpanel/create",
              "_blank"
            );
          }}
        >
          Get your API key here <ArrowRight size={16} weight="bold" />
        </Button>
      </div>
    </SettingsContainer>
  );
};
