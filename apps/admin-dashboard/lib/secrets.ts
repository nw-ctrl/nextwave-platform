type SecretRecord = {
  key: string;
  value: string;
  updatedAt: string;
};

const registry = new Map<string, SecretRecord>();

export function putSecret(key: string, value: string) {
  const item = { key, value, updatedAt: new Date().toISOString() };
  registry.set(key, item);
  return { key: item.key, updatedAt: item.updatedAt };
}

export function getSecret(key: string) {
  return registry.get(key);
}

export function resolveSecretValue(ref?: string | null) {
  if (!ref) {
    return undefined;
  }

  if (ref.startsWith("env:")) {
    const envKey = ref.slice(4);
    return process.env[envKey];
  }

  if (ref.startsWith("secret:")) {
    const secretKey = ref.slice(7);
    return registry.get(secretKey)?.value;
  }

  return process.env[ref] ?? registry.get(ref)?.value;
}

export function listSecrets() {
  return [...registry.values()].map(({ key, updatedAt }) => ({ key, updatedAt }));
}