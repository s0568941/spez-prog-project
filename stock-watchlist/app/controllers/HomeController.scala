package controllers

import javax.inject._
import play.api._
import play.api.data.Form
import play.api.data.Forms.{mapping, text}
import play.api.mvc._

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject()(val controllerComponents: MessagesControllerComponents) extends MessagesBaseController {
  // TODO: make it a constant
  val registerForm = Form(mapping(
    "Username" -> text(3, 20),
    "Password" -> text(5),
    "Confirm Password" -> text(5))(Register.apply)(Register.unapply))

  /**
   * Create an Action to render an HTML page.
   *
   * The configuration in the `routes` file means that this method
   * will be called when the application receives a `GET` request with
   * a path of `/`.
   */
  def index() = Action { implicit request: MessagesRequest[AnyContent] =>
    val user = request.session.get("username")
    user.map(u => {
      Ok(views.html.index(registerForm, u))
    }).getOrElse(Ok(views.html.index(registerForm)))
//    Ok(views.html.index3(registerForm))
  }
}
