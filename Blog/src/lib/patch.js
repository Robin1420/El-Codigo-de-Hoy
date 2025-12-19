function normalizeValue(key, value) {
  if (value === undefined) return null;
  if (key && key.endsWith("_at") && value) {
    const time = Date.parse(value);
    return Number.isNaN(time) ? value : time;
  }
  if (value && typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return value;
    }
  }
  return value;
}

export function getChangedFields(values, initialValues = {}) {
  const patch = {};
  Object.entries(values || {}).forEach(([key, value]) => {
    const nextNormalized = normalizeValue(key, value);
    const prevNormalized = normalizeValue(key, initialValues?.[key]);
    if (nextNormalized !== prevNormalized) {
      patch[key] = value;
    }
  });
  return patch;
}

