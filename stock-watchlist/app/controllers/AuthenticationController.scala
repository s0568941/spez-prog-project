package controllers

import play.api.mvc._
import play.api.data.Forms._
import play.api.data._

import javax.inject._
import play.api.libs.json.Json

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
      Ok(views.html.index(registerForm, u))
    }).getOrElse(Ok(views.html.index(registerForm)))
  }

  def authStatus = Action { implicit request: Request[AnyContent] =>
    val user = request.session.get("username")
    user.map(userLoggedIn => {
      Ok(Json.toJson(Json.obj(
        "loggedIn" -> true
      )))
    }).getOrElse(
      Ok(Json.toJson(Json.obj(
        "loggedIn" -> false
      )))
    )
  }

  def logout() = Action { implicit request: MessagesRequest[AnyContent] =>
    Redirect(routes.HomeController.index).withNewSession
  }
}
