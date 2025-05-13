'use client';
import { SETTING_TABS } from '@repo/common/store';
import { ApiKeySettings } from './api';
import { MCPSettings } from './mcp';
import { CreditsSettings } from './usage';

const SettingsPage = () => {
    const settingMenu = [
        {
            title: 'Usage',
            description: 'Manage your usage credits',
            key: SETTING_TABS.CREDITS,
            component: <CreditsSettings />,
        },
        {
            title: 'API Keys',
            description:
                'By default, your API Key is stored locally on your browser and never sent anywhere else.',
            key: SETTING_TABS.API_KEYS,
            component: <ApiKeySettings />,
        },
        {
            title: 'MCP Tools',
            description: 'Connect your MCP tools. This will only work with your own API keys.',
            key: SETTING_TABS.MCP_TOOLS,
            component: <MCPSettings />,
        },
    ];

    return (
        <div className="no-scrollbar relative max-w-full overflow-y-auto overflow-x-hidden">
            <div className="flex flex-row gap-6 py-12">
                <div className="mx-auto flex max-w-2xl flex-1 flex-col gap-8 overflow-hidden px-4">
                    <h3 className="border-border bg-secondary text-xl font-semibold">Settings</h3>
                    {settingMenu.map(item => (
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col">
                                <h4 className="text-base font-semibold">{item.title}</h4>
                            </div>
                            <div
                                key={item.key}
                                className="bg-background border-hard rounded-md border px-6 py-2"
                            >
                                {item.component}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
