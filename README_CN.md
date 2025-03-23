# open-proxy-apis

[English](./README.md) | [中文](#中文)

一个ai服务商代理层（当然不一定只是代理商），主要为了满足在国内突破伟大的防火长城限制，出去批判西方世界的ai服务。

目前支持：

- groq
- cohere
- gemini
- deepseek
- kimi

因为ai服务往往意味着付费。因此，本项目聚合上述服务同时，做了一个极为基础的验证。如果需要生产级别的验证，请二次开发。

部署于[deno deploy](https://dash.deno.com/)，本服务在我另外一个项目[ui-chat](https://github.com/dangjingtao/ui-chat-view)中得到了应用。

## 本地运行

首先安装 [Deno](https://deno.com/)

```bash
curl -fsSL https://deno.land/install.sh | sh 
```
然后克隆本项目。并修改环境变量。

```sh
git clone https://github.com/dangjingtao/open-proxy-api-deno.git
cd open-proxy-api-deno
cp ".env example" ".env"
```

你可以在任意一个记事本中编辑`.env`文件的环境变量

```bash
# 这是你自己的apiKey,
API_KEY = <your-api-key>
# 需要从对应服务商处取得
GROQ_API_KEY = 
DEEPSEEK_API_KEY = 
KIMI_API_KEY = 
COHERE_API_KEY = 
GEMINI_API_KEY = 
```

在项目`/src/config/provider.config.ts`文件配置请求域名

```bash
# 这是你自己定义的apiKey,请妥善设置
API_KEY = <your-api-key>
# 需要从对应服务商处取得
GROQ_API_KEY = 
DEEPSEEK_API_KEY = 
KIMI_API_KEY = 
COHERE_API_KEY = 
GEMINI_API_KEY = 
```

然后。愉快的执行：


```shell
deno task dev
```

服务将在本机`8000`端口运行。

调试：

```bash
curl --request GET \
  --url 'https://localhost:8000/kimi/v1/models' \
  --header 'Authorization: Bearer <your-api-key>' 
```

## Work with Deno deploy

1. [fork](https://github.com/dangjingtao/open-proxy-api-deno/fork)本项目

2. 在github上修改可请求域名(open-proxy-api-deno/blob/main/src/config/provider.config.ts)：
   ```ts
   export const allowedOrigins = [
   -  "http://localhost:8461",
   -  "https://ui-chat-view.pages.dev",
   -  "https://uichat.tomz.io",
   +  你的域名  
   ];
   ```

3. github账号 登录 https://dash.deno.com/

4. 创建项目 https://dash.deno.com/new_project

5. 选择此项目，填写项目名字（请仔细填写项目名字，关系到自动分配的域名）

6. Entrypoint 填写 `src/main.ts` 

7. 点击 **Deploy Project**

8. 在线上设置环境变量
   ```bash
   # 这是你自己定义的apiKey,请妥善设置
   API_KEY = <your-api-key>
   # 需要从对应服务商处取得
   GROQ_API_KEY = 
   DEEPSEEK_API_KEY = 
   KIMI_API_KEY = 
   COHERE_API_KEY = 
   GEMINI_API_KEY = 
   ```

9. 部署成功后获得域名，点开即用。

## 调用示例

```js
async function fetchFileContent({
  owner,
  repo,
  branch,
  filePath,
  token = null,
}) {
  const url = `http://localhost:8000/github-api/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;

  const headers = {
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Error fetching ${filePath}: ${response.statusText}`);
  }

  const data = await response.json();
  return atob(data.content);
}

// 使用示例
fetchFileContent({
  owner: "dangjingtao",
  repo: "ui-chat-view",
  branch: "main",
  filePath: "README.md",
  token: '<your api key>',
})
  .then((content) => console.log(content))
  .catch((error) => console.error(error));
```

