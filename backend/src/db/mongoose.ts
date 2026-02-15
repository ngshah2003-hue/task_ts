import mongoose from "mongoose";
import chalk from "chalk";

mongoose.connection.on("connected", () => {
  console.log(chalk.blue.bold("Database Connection Established✅"));
});
mongoose.connection.on("reconnected", () => {
  console.log("Database Connection Reestablished");
});
mongoose.connection.on("disconnected", () => {
  console.log("Database Connection Disconnected");
});
mongoose.connection.on("close", () => {
  console.log("Database Connection Closed");
});
mongoose.connection.on("error", (error: Error) => {
  console.log(chalk.bgRed.bold("⚠️ [Database ERROR]") + chalk.red(error));
});

export class MongoUtil {
  static newObjectId(): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId();
  }

  static toObjectId(stringId: string): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId(stringId);
  }

  static isValidObjectID(id: string): boolean {
    return mongoose.isValidObjectId(id);
  }
}

export function initConnection(callback: () => void): void {
  if (process.env.isProduction === "true") {
  }
  mongoose.connect(process.env.Database_URL as string);
  const db = mongoose.connection;
  db.once("open", () => {
    callback();
  });
}

export { mongoose };
