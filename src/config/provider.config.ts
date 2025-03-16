export type ProviderConfigItem = {
  provider_name: string;
  api_host: string;
  require_api_key: boolean;
};

export const providerConfig: ProviderConfigItem[] = [
  {
    provider_name: "groq",
    api_host: "https://api.groq.com",
    require_api_key: true,
  },
  {
    provider_name: "cohere",
    api_host: "https://api.cohere.ai",
    require_api_key: true,
  },
  {
    provider_name: "deepseek",
    api_host: "https://api.deepseek.com",
    require_api_key: true,
  },
  {
    provider_name: "kimi",
    api_host: "https://api.moonshot.cn",
    require_api_key: true,
  },
  {
    provider_name: "gemini",
    api_host: "https://generativelanguage.googleapis.com",
    require_api_key: true,
  },
  {
    provider_name: "github-api",
    api_host: "https://api.github.com",
    require_api_key: false,
  },
];

export type ProviderKeys = keyof typeof providerConfig;
