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

  /**
   * Create an Action to render an HTML page.
   *
   * The configuration in the `routes` file means that this method
   * will be called when the application receives a `GET` request with
   * a path of `/`.
   */
  def index() = Action { implicit request: MessagesRequest[AnyContent] =>
    // if session exists and user is logged in -> show "Welcome user"
    // else: show login page
//    val values = request.body.asFormUrlEncoded
    val authError = request.session.get("error")
    authError.map(e => {
      Redirect(routes.AuthenticationController.index).flashing("error" -> e).withNewSession
    }).getOrElse(Redirect(routes.AuthenticationController.index))
//    Redirect(routes.AuthenticationController.index)
  }
}
