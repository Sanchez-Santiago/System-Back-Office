export function convertBigIntToString(obj: any): any {
  if (typeof obj === "bigint") {
    return obj.toString();
  }
  if (obj !== null && typeof obj === "object") {
    if (typeof obj.toISOString === "function") {
      return obj.toISOString();
    }
    if (obj.epoch && typeof obj.epoch === "number") {
      return new Date(obj.epoch * 1000).toISOString();
    }
    if (Array.isArray(obj)) {
      return obj.map(convertBigIntToString);
    }
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertBigIntToString(obj[key]);
    }
    return converted;
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  }
  return obj;
}

export function convertBigIntToNumber(obj: any): any {
  if (typeof obj === "bigint") {
    return Number(obj);
  }
  if (obj !== null && typeof obj === "object") {
    if (Array.isArray(obj)) {
      return obj.map(convertBigIntToNumber);
    }
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertBigIntToNumber(obj[key]);
    }
    return converted;
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToNumber);
  }
  return obj;
}

export function sanitizeQueryParams(params: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const key in params) {
    const value = params[key];
    if (value !== undefined && value !== null && value !== "") {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function paginateParams(params: { page?: number; limit?: number }) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}