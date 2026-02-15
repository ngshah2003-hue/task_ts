import { Request } from "express";
export declare function create(req: Request): Promise<{
    card: import("../db/models/card").ICardDoc;
}>;
export declare function update(req: Request): Promise<{
    card: import("../db/models/card").ICardDoc;
}>;
export declare function remove(req: Request): Promise<{
    success: boolean;
}>;
export declare function move(req: Request): Promise<{
    card: import("../db/models/card").ICardDoc;
}>;
export declare function listByBoard(req: Request): Promise<import("../db/services/CardService").CardListResult>;
//# sourceMappingURL=CardController.d.ts.map