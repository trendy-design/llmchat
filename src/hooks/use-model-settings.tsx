import { usePreferenceContext } from "@/context/preferences/context";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { TModel, useModelList } from "./use-model-list";
import { TPreferences, defaultPreferences } from "./use-preferences";

export type TModelSettings = {
  refresh?: boolean;
};

export const useModelSettings = ({ refresh }: TModelSettings) => {
  const { getPreferences, setPreferences, preferencesQuery } =
    usePreferenceContext();
  const { getModelByKey } = useModelList();
  const [selectedModel, setSelectedModel] = useState<TModel>();

  const formik = useFormik<Partial<TPreferences>>({
    initialValues: {
      systemPrompt: "",
      messageLimit: 30,
      temperature: 0.5,
      topP: 1,
      topK: 5,
      maxTokens: 1000,
      googleSearchEngineId: "",
      googleSearchApiKey: "",
      defaultWebSearchEngine: "google",
    },
    onSubmit: (values) => {},
  });

  useEffect(() => {
    formik.setValues(preferencesQuery?.data || defaultPreferences);
    // getPreferences().then((preferences) => {
    //   setSelectedModel(getModelByKey(preferences.defaultModel));

    //   formik.setFieldValue(
    //     "systemPrompt",
    //     preferences.systemPrompt || defaultPreferences.systemPrompt
    //   );
    //   formik.setFieldValue(
    //     "messageLimit",
    //     preferences.messageLimit || defaultPreferences.messageLimit
    //   );
    //   formik.setFieldValue(
    //     "temperature",
    //     preferences.temperature || defaultPreferences.temperature
    //   );
    //   formik.setFieldValue("topP", preferences.topP || defaultPreferences.topP);
    //   formik.setFieldValue("topK", preferences.topK || defaultPreferences.topK);
    //   formik.setFieldValue(
    //     "maxTokens",
    //     preferences.maxTokens || defaultPreferences.maxTokens
    //   );
    //   formik.setFieldValue(
    //     "googleSearchEngineId",
    //     preferences.googleSearchEngineId || ""
    //   );
    //   formik.setFieldValue(
    //     "googleSearchApiKey",
    //     preferences.googleSearchApiKey || ""
    //   );
    //   formik.setFieldValue(
    //     "defaultWebSearchEngine",
    //     preferences.defaultWebSearchEngine ||
    //       defaultPreferences.defaultWebSearchEngine
    //   );
    // });
  }, [preferencesQuery]);

  return { formik, setPreferences, selectedModel };
};
