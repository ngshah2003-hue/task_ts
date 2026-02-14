import API from "../utils/apiBuilder";

const router = API.configRoute("/api")
  .addPath("/health")
  .asGET(async () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .build()
  .getRouter();

export default router;
