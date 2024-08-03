const macosOllamaConfig = `
#### Step 1: Install and Launch Ollama Locally

Ensure you have Ollama installed on your machine. If you haven't downloaded it yet, please visit the [official website](#) to get started.

#### Step 2: Set Up Cross-Origin Access for Ollama

To ensure proper functionality, you'll need to configure cross-origin settings due to browser security policies.

1. Open the **Terminal** application.
2. Enter the following command and press **Enter**:

   \`\`\`bash
   launchctl setenv OLLAMA_ORIGINS "\\*"
   \`\`\`
  `;

const windowsOllamaConfig = `
  #### Step 1: Install and Start Ollama Locally

  Please make sure you have enabled Ollama. If you haven't downloaded Ollama yet, please visit the [official website](https://ollama.com/download) to download.
  
  #### Step 2: Configure Ollama for Cross-Origin Access
  
  Due to browser security restrictions, you need to configure cross-origin settings for Ollama to function properly.
  
  1. On Windows, go to **Control Panel** and edit system environment variables.
  2. Create a new environment variable named \`OLLAMA_ORIGINS\` for your user account.
  3. Set the value to \`*\`, and click **OK/Apply** to save.
  
  Please restart the Ollama service after completion.
  `;

export const docs = {
  macosOllamaConfig,
  windowsOllamaConfig,
};
