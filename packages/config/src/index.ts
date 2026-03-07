export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  supabaseProjectRef: process.env.SUPABASE_PROJECT_REF ?? "nextwave-core",
  githubToken: process.env.GITHUB_TOKEN ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? ""
};
