export const FeatureFlags = {
  enableAuth: process.env.NEXT_PUBLIC_ENABLE_AUTH === 'true',
};

export const isFeatureEnabled = (flag: keyof typeof FeatureFlags) => {
  return FeatureFlags[flag] || false;
};
