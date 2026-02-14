export interface MongooseError extends Error {
  errors?: Record<string, { message?: string; errors?: Record<string, { properties?: { message?: string }; message?: string }> }>;
}

const Util = class {
  static getErrorMessage(mongooseException: MongooseError): { error: string } {
    try {
      if (mongooseException.errors) {
        const mainJSONKeys = Object.keys(mongooseException.errors);
        const firstError = mongooseException.errors[mainJSONKeys[0]];
        if (firstError?.errors) {
          const jsonKeys = Object.keys(firstError.errors);
          return {
            error:
              firstError.errors[jsonKeys[0]]?.properties?.message ??
              firstError.errors[jsonKeys[0]]?.message ??
              firstError.message ??
              "Unknown error",
          };
        }
        return { error: firstError?.message ?? "Unknown error" };
      }
      return { error: mongooseException.message };
    } catch {
      return { error: mongooseException.message };
    }
  }

  static getErrorMessageFromString(message: string): { error: string } {
    return { error: message };
  }

  static getBaseURL(): string {
    const baseURL = process.env.HOST || "http://127.0.0.1";
    if (!Util.useProductionSettings()) {
      return `${baseURL}:${process.env.PORT || 8000}`;
    }
    return baseURL;
  }

  static useProductionSettings(): boolean {
    return `${process.env.isProd ?? process.env.NODE_ENV}`.toLowerCase() === "true";
  }

  static parseBoolean(b: unknown): boolean {
    return `${b}`.toLowerCase() === "true";
  }
};

export default Util;
