# open-proxy-apis

[English](#english) | [中文](./README_CN.md)

An AI service provider proxy layer (not necessarily just for resellers),
primarily designed to meet the needs of people in China to access and critique
Western AI services.

Currently supported:

- groq
- cohere
- deepseek
- kimi
- gemini
- openrouter
- cloudflare AI
- Tavily search
- Notion
- GitHub API

Since AI services often imply payment, this project not only aggregates the
above services but also implements a very basic authentication mechanism. If you
need production-level authentication, please develop further.

Designed for deployment on [Cloudflare Workers](https://workers.cloudflare.com/),
this service is utilized in my another project
[ui-chat](https://github.com/dangjingtao/ui-chat-view).

## Run in Local

Firstly, install [Node.js](https://nodejs.org/) and Wrangler.

```bash
npm install
```

Then clone this project and modify the environment variables.

```sh
git clone https://github.com/dangjingtao/open-proxy-api-deno.git
cd open-proxy-api-deno
cp ".env example" ".dev.vars"
```

You can edit the environment variables in any text editor.

```bash
# This is your own apiKey,
API_KEY = <your-api-key>
# Obtain from the corresponding service provider
GROQ_API_KEY =
DEEPSEEK_API_KEY =
KIMI_API_KEY =
COHERE_API_KEY =
GEMINI_API_KEY =
```

Configure the request domain in the project's `/src/config/provider.config.ts`
file.

```bash
# This is your own apiKey, please set it properly
API_KEY = <your-api-key>
# Obtain from the corresponding service provider
GROQ_API_KEY =
DEEPSEEK_API_KEY =
KIMI_API_KEY =
COHERE_API_KEY =
GEMINI_API_KEY =
```

Then, happily execute:

```shell
npm run dev
```

The service will run on port `8787` of your local machine.

For debugging:

```bash
curl --request GET \
  --url 'http://localhost:8787/api/kimi/v1/models' \
  --header 'Authorization: Bearer <your-api-key>'
```

## Work with Cloudflare Workers

1. Fork this project.

2. Modify the allowed request domains in
   `src/config/origin.config.ts`.

   ```ts
   export const allowedOrigins = [
   -  "http://localhost:8461",
   -  "https://ui-chat-view.pages.dev",
   -  "https://uichat.tomz.io",
   +  your domain
   ];
   ```

3. Log in to Cloudflare:

   ```bash
   npx wrangler login
   ```

4. Configure secrets:

   ```bash
   npx wrangler secret put API_KEY
   npx wrangler secret put JWT_SECRET
   npx wrangler secret put INVITATION_CODE
   npx wrangler secret put GROQ_API_KEY
   ```

   Add the other provider keys when those providers are enabled.

5. Deploy:

   ```bash
   npm run deploy
   ```
