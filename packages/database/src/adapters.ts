export const supportedAdapters = ["supabase", "postgres", "firebase", "mongodb", "redis"] as const;

export type Adapter = (typeof supportedAdapters)[number];

export function isSupportedAdapter(adapter: string): adapter is Adapter {
  return supportedAdapters.includes(adapter as Adapter);
}
