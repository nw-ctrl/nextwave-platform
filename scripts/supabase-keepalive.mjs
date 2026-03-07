#!/usr/bin/env node

const targetsRaw = process.env.SUPABASE_TARGETS_JSON;

if (!targetsRaw) {
  console.error("Missing SUPABASE_TARGETS_JSON secret.");
  process.exit(1);
}

let targets;
try {
  targets = JSON.parse(targetsRaw);
} catch (error) {
  console.error("SUPABASE_TARGETS_JSON is not valid JSON.");
  process.exit(1);
}

if (!Array.isArray(targets) || targets.length === 0) {
  console.error("SUPABASE_TARGETS_JSON must be a non-empty array.");
  process.exit(1);
}

function safeName(target, index) {
  if (target.name && typeof target.name === "string") {
    return target.name;
  }

  try {
    return new URL(target.url).host;
  } catch {
    return `target-${index + 1}`;
  }
}

async function pingTarget(target, index) {
  const name = safeName(target, index);

  if (!target.url || !target.anonKey) {
    throw new Error(`${name}: missing url or anonKey`);
  }

  const baseUrl = target.url.replace(/\/+$/, "");
  const headers = {
    apikey: target.anonKey,
    Authorization: `Bearer ${target.anonKey}`
  };

  const endpoints = [
    `${baseUrl}/auth/v1/settings`,
    `${baseUrl}/rest/v1/`,
    `${baseUrl}/rest/v1/${target.keepaliveTable ?? "users"}?select=*&limit=1`
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { method: "GET", headers });
      if (response.ok) {
        console.log(`${name}: keepalive ok via ${new URL(endpoint).pathname}`);
        return;
      }
    } catch {
      // Try next endpoint
    }
  }

  throw new Error(`${name}: all keepalive endpoint checks failed`);
}

const failures = [];
for (let i = 0; i < targets.length; i += 1) {
  try {
    // eslint-disable-next-line no-await-in-loop
    await pingTarget(targets[i], i);
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  }
}

if (failures.length > 0) {
  console.error("Keepalive failures:\n" + failures.map((m) => `- ${m}`).join("\n"));
  process.exit(1);
}

console.log(`Keepalive completed for ${targets.length} target(s).`);