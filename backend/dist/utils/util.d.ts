export interface MongooseError extends Error {
    errors?: Record<string, {
        message?: string;
        errors?: Record<string, {
            properties?: {
                message?: string;
            };
            message?: string;
        }>;
    }>;
}
declare const Util: {
    new (): {};
    getErrorMessage(mongooseException: MongooseError): {
        error: string;
    };
    getErrorMessageFromString(message: string): {
        error: string;
    };
    getBaseURL(): string;
    useProductionSettings(): boolean;
    parseBoolean(b: unknown): boolean;
};
export default Util;
//# sourceMappingURL=util.d.ts.map