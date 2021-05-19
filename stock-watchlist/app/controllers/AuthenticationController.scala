package controllers

import play.api.mvc._
import play.api.data.Forms._
import play.api.data._

import javax.inject._
import models.AuthenticationModel

case class Register(username: String, password: String, confirmPassword: String)

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class AuthenticationController @Inject()(val controllerComponents: MessagesControllerComponents) extends MessagesBaseController {
  // TODO: make it a constant
  val registerForm = Form(mapping(
    "Username" -> text(3, 20),
    "Password" -> text(5),
    "Confirm Password" -> text(5))(Register.apply)(Register.unapply))

  def index() = Action { implicit request: MessagesRequest[AnyContent] =>
    val user = request.session.get("username")
    user.map(u => {
      Ok(views.html.index(u))
    }).getOrElse(Ok(views.html.login()))
  }

  def registerBadRequest(formWithErrors: Form[Register]) = Action { implicit request: MessagesRequest[AnyContent] =>
    BadRequest(views.html.register(formWithErrors))
  }

  def register() = Action { implicit request: MessagesRequest[AnyContent] =>
    Ok(views.html.register(registerForm))
  }

  // TODO: not used anymore
  def validateRegister() = Action { implicit request: MessagesRequest[AnyContent] =>
    val values = request.body.asFormUrlEncoded
    values.map(vals => {
      val username = vals("username").head
      val password = vals("password").head
      val confirmPassword = vals("confirmPassword").head
      if (AuthenticationModel.registerUser(username, password)) {
        // user is registered and returns to login
        Redirect(routes.AuthenticationController.index)//.withSession("username" -> username)
      } else if (password.isEmpty || confirmPassword.isEmpty) {
        Redirect(routes.AuthenticationController.register()).flashing("error" -> "Please enter a password and confirm it.")
      } else if (password != confirmPassword) {
        Redirect(routes.AuthenticationController.register()).flashing("error" -> "The passwords you entered do not match.")
      } else {
        // user is not registered and returns to registration
        Redirect(routes.AuthenticationController.register()).flashing("error" -> "The username you entered is already taken.")
      }
    }).getOrElse(Redirect(routes.HomeController.index))
  }

  // TODO: DELETE
  def validateRegisterForm() = Action { implicit request: MessagesRequest[AnyContent] =>
    registerForm.bindFromRequest.fold(
      formWithErrors => BadRequest(views.html.register(formWithErrors)),
      registerData => {
        if (registerData.password != registerData.confirmPassword) {
          Redirect(routes.AuthenticationController.register()).flashing("error" -> "The passwords you entered do not match.")
        } else {
          if (AuthenticationModel.registerUser(registerData.username, registerData.password)) {
            // user is registered and returns to login
            Redirect(routes.HomeController.index).flashing("success" -> "Registration successful.")
          } else {
            // user is not registered and returns to registration
            Redirect(routes.AuthenticationController.register()).flashing("error" -> "The username you entered is already taken.")
          }
        }
      }
    )
  }

  // TODO: DELETE
  def validateLogin() = Action { implicit request: MessagesRequest[AnyContent] =>
    val values = request.body.asFormUrlEncoded
    values.map(vals => {
      val username = vals("username").head
      val password = vals("password").head
      if (AuthenticationModel.validateLogin(username, password)) {
        // user is logged in and will be redirected to index ("Welcome user")
        Redirect(routes.AuthenticationController.index).withSession("username" -> username)
      } else {
        // user is not logged in and returns to login page
        Redirect(routes.HomeController.index).flashing("error" -> "The username or password you entered is not valid.")
      }
    }).getOrElse(Redirect(routes.HomeController.index))
  }

  def logout() = Action { implicit request: MessagesRequest[AnyContent] =>
    Redirect(routes.HomeController.index).withNewSession
  }
}
