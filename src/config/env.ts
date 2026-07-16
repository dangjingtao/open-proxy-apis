export type AppEnv = Record<string, string | undefined>;

export const getEnv = (
  env: AppEnv | undefined,
  name: string,
): string | undefined => {
  return env?.[name];
};
