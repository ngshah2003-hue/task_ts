import API from "../utils/apiBuilder";
import * as UserController from "../controllers/UserController";
import * as BoardMemberController from "../controllers/BoardMemberController";

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

  .addPath("/invite/accept")
  .asPOST(BoardMemberController.acceptInvite)
  .useUserAuth()
  .build()

  .getRouter();

export default router;
