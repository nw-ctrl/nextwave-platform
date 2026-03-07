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

export function listSecrets() {
  return [...registry.values()].map(({ key, updatedAt }) => ({ key, updatedAt }));
}