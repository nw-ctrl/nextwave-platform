import {
  getDatabaseConnectionById,
  healthcheckDatabaseConnection,
  listDatabaseConnections,
  upsertDatabaseConnection,
  type DatabaseConnectionProfile
} from "@nextwave/database";
import { resolveSecretValue } from "./secrets";

function materializeValue(value: unknown): unknown {
  if (typeof value === "string") {
    return resolveSecretValue(value) ?? value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => materializeValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, materializeValue(v)])
    );
  }

  return value;
}

function materializeProfileSecrets(profile: DatabaseConnectionProfile): DatabaseConnectionProfile {
  return {
    ...profile,
    connectionRef: (materializeValue(profile.connectionRef) as string | undefined) ?? profile.connectionRef,
    config: (materializeValue(profile.config ?? {}) as Record<string, unknown>)
  };
}

export async function listConnections(clientId?: string) {
  return listDatabaseConnections(clientId);
}

export async function saveConnection(input: DatabaseConnectionProfile) {
  return upsertDatabaseConnection(input);
}

export async function testConnectionById(connectionId: string) {
  const connection = await getDatabaseConnectionById(connectionId);
  if (!connection) {
    throw new Error("Connection not found");
  }

  return healthcheckDatabaseConnection(materializeProfileSecrets(connection));
}

export async function testConnectionProfile(profile: DatabaseConnectionProfile) {
  return healthcheckDatabaseConnection(materializeProfileSecrets(profile));
}