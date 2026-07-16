import { Context, Hono } from "hono";
import { NotionConverter } from "notion-to-md";
import { DefaultExporter } from "notion-to-md/plugins/exporter";
import { APIErrorCode, Client, isNotionClientError } from "@notionhq/client";
import { getEnv } from "../config/env.ts";

const getNotionConfig = (context: Context) => {
  const apiKey = getEnv(context.env, "NOTION_API_KEY");
  return {
    notion: new Client({ auth: apiKey }),
    databaseId: getEnv(context.env, "NOTION_DB_ID"),
  };
};

const getUsers = async (context: Context) => {
  try {
    const { notion } = getNotionConfig(context);
    const listUsersResponse = await notion.users.list({});

    return context.json(listUsersResponse.results, 200);
  } catch (error) {
    if (
      isNotionClientError(error) &&
      error.code === APIErrorCode.ObjectNotFound
    ) {
      return context.json({ error: "Notion object not found" }, 404);
    }

    console.error(error);
    return context.json({ error: "Notion request failed" }, 500);
  }
};

const getBot = async (context: Context) => {
  try {
    const { notion } = getNotionConfig(context);
    const bot = await notion.users.me({});

    return context.json(bot, 200);
  } catch (error) {
    if (
      isNotionClientError(error) &&
      error.code === APIErrorCode.ObjectNotFound
    ) {
      return context.json({ error: "Notion object not found" }, 404);
    }

    console.error(error);
    return context.json({ error: "Notion request failed" }, 500);
  }
};

const getDatabase = async (context: Context) => {
  const { notion, databaseId } = getNotionConfig(context);
  if (!databaseId) {
    throw new Error("NOTION_DB_ID is not defined");
  }

  try {
    const listUsersResponse = await notion.databases.query({
      database_id: databaseId,
    });

    return context.json(listUsersResponse.results, 200);
  } catch (error) {
    if (
      isNotionClientError(error) &&
      error.code === APIErrorCode.ObjectNotFound
    ) {
      return context.json({ error: "Notion database not found" }, 404);
    }

    console.error(error);
    return context.json({ error: "Notion request failed" }, 500);
  }
};

// blocks
const retrievePage = async (context: Context) => {
  const pageId = context.req.param("id");

  const buffer: Record<string, string> = {};
  const exporter = new DefaultExporter({
    outputType: "buffer",
    buffer: buffer,
  });

  const { notion } = getNotionConfig(context);
  const n2m = new NotionConverter(notion).withExporter(exporter);
  await n2m.convert(pageId);

  return context.json(buffer[pageId], 200);
};

const createPageWithContent = async (context: Context) => {
  const { notion, databaseId } = getNotionConfig(context);
  if (!databaseId) {
    return context.json({ error: "NOTION_DB_ID is not defined" }, 500);
  }

  const body = await context.req.json();
  const params = {
    parent: { database_id: databaseId },
    ...body,
  };

  const response = await notion.pages.create(params);
  return context.json(response, 200);
};

export default new Hono()
  .get("/me", getBot)
  .get("/users", getUsers)
  .get("/database", getDatabase)
  .get("/page/:id", retrievePage)
  .post("/page", createPageWithContent);
