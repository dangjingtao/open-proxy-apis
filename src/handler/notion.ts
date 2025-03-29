import { Context, Hono } from "hono";
import { NotionConverter } from "notion-to-md";
import { DefaultExporter } from "notion-to-md/plugins/exporter";
// import { createFactory } from "hono/factory";
import { Client, APIErrorCode } from "@notionhq/client";
const NOTION_API_KEY = Deno.env.get("NOTION_API_KEY");
const NOTION_DB_ID = Deno.env.get("NOTION_DB_ID");

const notion = new Client({
  auth: NOTION_API_KEY,
});

const getUsers = async (context: Context) => {
  try {
    const listUsersResponse = await notion.users.list({});

    return context.json(listUsersResponse.results, 200);
  } catch (error) {
    if (error.code === APIErrorCode.ObjectNotFound) {
      //
      // For example: handle by asking the user to select a different database
      //
    } else {
      // Other error handling code
      console.error(error);
    }
  }
};

const getBot = async (context: Context) => {
  try {
    const bot = await notion.users.me();

    return context.json(bot, 200);
  } catch (error) {
    if (error.code === APIErrorCode.ObjectNotFound) {
      //
      // For example: handle by asking the user to select a different database
      //
    } else {
      // Other error handling code
      console.error(error);
    }
  }
};

const getDatabase = async (context: Context) => {
  if (!NOTION_DB_ID) {
    throw new Error("NOTION_DB_ID is not defined");
  }

  try {
    const listUsersResponse = await notion.databases.query({
      database_id: NOTION_DB_ID,
    });

    return context.json(listUsersResponse.results, 200);
  } catch (error) {
    if (error.code === APIErrorCode.ObjectNotFound) {
    } else {
      // Other error handling code
      console.error(error);
    }
  }
};

// blocks
const retrievePage = async (context: Context) => {
  const pageId = context.req.param("id");

  const buffer = {};
  const exporter = new DefaultExporter({
    outputType: "buffer",
    buffer: buffer,
  });

  const n2m = new NotionConverter(notion).withExporter(exporter);
  await n2m.convert(pageId);

  return context.json(buffer[pageId], 200);
};

const createPageWithContent = async (context: Context) => {
  const body = await context.req.json();
  const params = {
    parent: { database_id: NOTION_DB_ID },
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
