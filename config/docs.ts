const macosOllamaConfig = `
#### Step 1: Install and Launch Ollama Locally

Ensure you have Ollama installed on your machine. If you haven't downloaded it yet, please visit the [official website](https://ollama.com/download) to get started.

#### Step 2: Set Up Cross-Origin Access for Ollama

To ensure proper functionality, you'll need to configure cross-origin settings due to browser security policies.

1. Open the **Terminal** application.
2. Enter the following command and press **Enter**:

   \`\`\`bash
   launchctl setenv OLLAMA_ORIGINS "*"
   \`\`\`
  
Important: Please restart the Ollama service after completion.

#### Step 3: Pull the model of your choice

\`\`\`bash
ollama pull llama3:latest
\`\`\`

Once the model is pulled, you can start using it in the chat.

#### Troubleshooting 

After following the steps above, if you are still unable to connect, please restart your ollama service and browser.

`;
const windowsOllamaConfig = `
  #### Step 1: Install and Start Ollama Locally

  Please make sure you have enabled Ollama. If you haven't downloaded Ollama yet, please visit the [official website](https://ollama.com/download) to download.
  
  #### Step 2: Configure Ollama for Cross-Origin Access
  
  Due to browser security restrictions, you need to configure cross-origin settings for Ollama to function properly.
  
  1. On Windows, go to **Control Panel** and edit system environment variables.
  2. Create a new environment variable named \`OLLAMA_ORIGINS\` for your user account.
  3. Set the value to \`*\`, and click **OK/Apply** to save.

  #### Step 3: Pull the latest model

\`\`\`bash
ollama pull llama3:latest
\`\`\`

Once the model is pulled, you can start using it in the chat.

  
  Important: Please restart the Ollama service after completion.
  `;

const lmStudioConfig = `
  #### Step 1: Install and Launch LM Studio Locally
  
  Ensure you have LM Studio installed on your Mac. If you haven't downloaded it yet, please visit the [official website](https://lmstudio.ai/download) to get started.
  
  #### Step 2: Enable the LM Studio Server and Configure CORS
  
  To allow your project to communicate with LM Studio, you'll need to enable the server feature and configure Cross-Origin Resource Sharing (CORS).
  
  1. Open **LM Studio**.
  2. Click on the **Server** tab located in the sidebar.
  3. Toggle the **Enable Server** option to **On**.
  4. Click on **Settings** within the Server tab.
  5. Enable **CORS** (Cross-Origin Resource Sharing).
  6. Set the allowed origins to \`*\` to permit all origins, or specify your project's origin.
  7. Note the server URL displayed; you'll need this for your project configuration.
  
  #### Step 3: Download the Model of Your Choice
  
  1. Navigate to the **Models** tab in LM Studio.
  2. Browse and download the model you wish to use.
  3. Wait for the download and installation to complete.
  
  Once the model is installed and the server is running with CORS enabled, you can start using it in your project.
`;

export const docs = {
  macosOllamaConfig,
  windowsOllamaConfig,
  lmStudioConfig
};
