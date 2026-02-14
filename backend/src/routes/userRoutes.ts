import API from "../utils/apiBuilder";
import * as UserController from "../controllers/UserController";

const router = API.configRoute("/user")
  .addPath("/signup")
  .asPOST(UserController.signup)
  .build()

  .addPath("/login")
  .asPOST(UserController.login)
  .build()

  .addPath("/logout")
  .asPOST(UserController.logout)
  .useUserAuth()
  .build()

  .addPath("/me")
  .asGET(UserController.me)
  .useUserAuth()
  .build()

  .getRouter();

export default router;
