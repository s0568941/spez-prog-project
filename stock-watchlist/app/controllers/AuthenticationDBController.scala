package controllers

import models.{AuthenticationDBModel, AuthenticationModel}
import play.api.data.Form
import play.api.data.Forms.{mapping, text}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.mvc._
import slick.jdbc.JdbcProfile

import javax.inject._
import scala.concurrent.{ExecutionContext, Future}



@Singleton
class AuthenticationDBController @Inject()(protected val dbConfigProvider: DatabaseConfigProvider, cc: ControllerComponents)(
  implicit ec: ExecutionContext
) extends AbstractController(cc)
  with HasDatabaseConfigProvider[JdbcProfile] {
  val registerForm = Form(mapping(
    "Username" -> text(3, 20),
    "Password" -> text(5),
    "Confirm Password" -> text(5))(Register.apply)(Register.unapply))
  private val model = new AuthenticationDBModel(db)

  // TODO: Workaround - only for DB milestone 8.5.21
  def validateRegisterForm() = Action.async { implicit request: Request[AnyContent] =>
    registerForm.bindFromRequest.fold(
      formWithErrors => Future.successful(Redirect(routes.AuthenticationController.register)),
      registerData => {
        if (registerData.password != registerData.confirmPassword) {
          // TODO: flashing error - passwords must match
          Future.successful(Redirect(routes.AuthenticationController.register()).flashing("error" -> "The passwords you entered do not match."))
        } else {
//          if (AuthenticationModel.registerUser(registerData.username, registerData.password)) {
            model.registerUser(registerData.username, registerData.password).map { userRegistered =>
            // user is registered and returns to login
              if (userRegistered) {
                (Redirect(routes.HomeController.index).flashing("success" -> "Registration successful."))
              } else {
                // user is not registered and returns to registration
                (Redirect(routes.AuthenticationController.register()).flashing("error" -> "The username you entered is already taken."))
              }
            //.withSession("username" -> username)
          }
        }
      }
    )
  }
//  def validateRegisterForm() = Action.async { implicit request: Request[AnyContent] =>
//    registerForm.bindFromRequest.fold(
//      // binding failure, you retrieve the form containing errors:
//      formWithErrors => Future.successful(BadRequest(views.html.register(formWithErrors))),
//      /* binding success, you get the actual value. */
//      registerData => {
//        if (registerData.password != registerData.confirmPassword) {
//          // TODO: flashing error - passwords must match
//          Future.successful(Redirect(routes.AuthenticationController.register()).flashing("error" -> "The passwords you entered do not match."))
//        } else {
//          if (AuthenticationModel.registerUser(registerData.username, registerData.password)) {
//            //          if (model.registerUser(registerData.username, registerData.password)) {
//            // user is registered and returns to login
//            Future.successful(Redirect(routes.HomeController.index).flashing("success" -> "Registration successful."))
//            //.withSession("username" -> username)
//          } else {
//            // user is not registered and returns to registration
//            Future.successful(Redirect(routes.AuthenticationController.register()).flashing("error" -> "The username you entered is already taken."))
//          }
//        }
//      }
//    )
//  }

  /**
   * checks login data of user and grants access if user is registered
   * otherwise user is redirected to login
   * @return
   */
  def validateLogin() = Action.async { implicit request: Request[AnyContent] =>
    val values = request.body.asFormUrlEncoded
    values.map(vals => {
      val username = vals("username").head
      val password = vals("password").head
      model.validateLogin(username, password).map(validUser =>
        if (validUser) {
          // user is logged in and will be redirected to index ("Welcome user")
          Redirect(routes.AuthenticationController.index).withSession("username" -> username)

        } else {
          // user is not logged in and will be redirected to login
//          Redirect(routes.HomeController.index).flashing("error" -> "The username or password you entered is not valid.")
          Redirect(routes.HomeController.index).withSession("error" -> "The username or password you entered is not valid.")

        }
      )
      }).getOrElse(Future.successful(Redirect(routes.HomeController.index)))
  }

}
