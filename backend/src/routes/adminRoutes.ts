import API from "../utils/apiBuilder";
import * as AuthController from "../controllers/AuthController";

const router = API.configRoute("/admin")
  .addPath("/signup")
  .asPOST(AuthController.signup)
  .build()

  .addPath("/login")
  .asPOST(AuthController.login)
  .build()

  .addPath("/logout")
  .asPOST(AuthController.logout)
  .useAdminAuth()
  .build()

  .addPath("/me")
  .asGET(AuthController.me)
  .useAdminAuth()
  .build()

  .getRouter();

export default router;
