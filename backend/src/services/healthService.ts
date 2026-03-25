export function getHealthStatus() {
  return {
    ok: true,
    service: "attire-backend",
    timestamp: new Date().toISOString(),
  };
}

