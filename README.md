# open-proxy-api-deno

[English](#english) | [中文](./README_CN.md)

An AI service provider proxy layer (not necessarily just for resellers), primarily designed to meet the needs of people in China to access and critique Western AI services.

Currently supported:

- groq
- cohere
- gemini
- ollama
- kimi

Since AI services often imply payment, this project not only aggregates the above services but also implements a very basic authentication mechanism. If you need production-level authentication, please develop further.

Deployed on [Deno Deploy](https://dash.deno.com/), this service is utilized in my another project [ui-chat](https://github.com/dangjingtao/ui-chat-view).

## Run in Local

Firstly, install [Deno](https://deno.com/).

```bash
curl -fsSL https://deno.land/install.sh | sh
```

Then clone this project and modify the environment variables.

```sh
git clone https://github.com/dangjingtao/open-proxy-api-deno.git
cd open-proxy-api-deno
cp ".env example" ".env"
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

Configure the request domain in the project's `/src/config/provider.config.ts` file.

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
deno task dev
```

The service will run on port `8000` of your local machine.

For debugging:

```bash
curl --request GET \
  --url 'https://localhost:8000/kimi/v1/models' \
  --header 'Authorization: Bearer <your-api-key>' 
```

## Work with Deno Deploy

1. [Fork](https://github.com/dangjingtao/open-proxy-api-deno/fork) this project.

2. Modify the allowed request domains on GitHub (open-proxy-api-deno/blob/main/src/config/provider.config.ts):
   ```ts
   export const allowedOrigins = [
   -  "http://localhost:8461",
   -  "https://ui-chat-view.pages.dev",
   -  "https://uichat.tomz.io",
   +  your domain  
   ];
   ```

3. Log in to [Deno Deploy](https://dash.deno.com/) with your GitHub account.

4. Create a project on [Deno Deploy](https://dash.deno.com/new_project).

5. Select this project and fill in the project name (please fill in the project name carefully, as it relates to the automatically assigned domain).

6. Set the entry point to `src/main.ts`.

7. Click **Deploy Project**.

8. Set the environment variables online:
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

9. After successful deployment, you will obtain a domain. Just click to use it.