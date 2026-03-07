type UsageEvent = {
  eventName: string;
  clientId?: string;
  payload?: Record<string, unknown>;
};

export function ingestUsageEvent(input: UsageEvent) {
  return {
    id: crypto.randomUUID(),
    eventName: input.eventName,
    clientId: input.clientId ?? null,
    payload: input.payload ?? {},
    timestamp: new Date().toISOString()
  };
}

export function summarizeMetrics(values: number[]) {
  const total = values.reduce((sum, value) => sum + value, 0);
  return {
    count: values.length,
    total,
    average: values.length ? total / values.length : 0
  };
}