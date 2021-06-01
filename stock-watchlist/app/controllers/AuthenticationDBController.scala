package controllers

import models.{AuthenticationDBModel, LoginData, RegisterData}
import play.api.data.Form
import play.api.data.Forms.{mapping, text}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.json.OFormat.oFormatFromReadsAndOWrites
import play.api.libs.json.{JsError, JsSuccess, Json, Writes}
import play.api.mvc._
import slick.jdbc.JdbcProfile

import javax.inject._
import scala.concurrent.{ExecutionContext, Future}



@Singleton
class AuthenticationDBController @Inject()(protected val dbConfigProvider: DatabaseConfigProvider, cc: MessagesControllerComponents)(
  implicit ec: ExecutionContext
) extends MessagesAbstractController(cc)
  with HasDatabaseConfigProvider[JdbcProfile] {
  val registerForm = Form(mapping(
    "username" -> text(3, 20),
    "password" -> text(5),
    "confPassword" -> text(5))(Register.apply)(Register.unapply))
  private val model = new AuthenticationDBModel(db)

  implicit val loginDataReads = Json.reads[LoginData]

  implicit val registerDataReads = Json.reads[RegisterData]
  implicit val registerDataWrites = Json.writes[RegisterData]
  implicit val registerFormWrites = Json.writes[Register]

  def validateRegisterForm() = Action.async { implicit request: MessagesRequest[AnyContent] =>
    registerForm.bindFromRequest.fold(
      formWithErrors => {
        val fieldRequiredErrors = formWithErrors.data.filter ( (key) =>
          key._2.equals("")
          )
        Future.successful(Ok(Json.toJson(Json.obj(
          "registerSuccess" -> false,
          "fieldRequiredError" -> fieldRequiredErrors
        ))).withSession("csrfToken" -> play.filters.csrf.CSRF.getToken.get.value))
      },
      registerData => {
        if (registerData.password != registerData.confirmPassword) {
          // https://www.nappin.com/blog/mixing-play-forms-and-javascript/
          // https://blog.knoldus.com/play-framework-2-0-ajax-calling-using-javascript-routing-in-scala/
          // flash does not work for ajax applications: https://www.playframework.com/documentation/2.8.x/ScalaSessionFlash#Flash-scope
          Future.successful(Ok(Json.toJson(Json.obj(
            "registerSuccess" -> false,
            "passwordMatchError" -> true
          ))).withSession("csrfToken" -> play.filters.csrf.CSRF.getToken.get.value))
        } else {
          model.registerUser(registerData.username, registerData.password).map { userRegistered =>
            // user is registered and returns to login
            if (userRegistered) {
              Ok(Json.toJson(Json.obj(
                "registerSuccess" -> true
              ))).withSession("csrfToken" -> play.filters.csrf.CSRF.getToken.get.value)
            } else {
              // user is not registered and returns to registration
              Ok(Json.toJson(Json.obj(
                "registerSuccess" -> false,
                "userExists" -> true
              ))).withSession("csrfToken" -> play.filters.csrf.CSRF.getToken.get.value)
            }
          }
        }
      }
    )
  }

  /**
   * checks login data of user and grants access if user is registered
   * otherwise user is redirected to login
   * @return
   */
  def validateLogin() = Action.async { implicit request: Request[AnyContent] =>
    val values = request.body.asJson
    values.map(vals => {
      Json.fromJson[LoginData](vals) match {
        case JsSuccess(loginData, path) => {
          model.validateLogin(loginData.username, loginData.password).map(validUser =>
            if (validUser) {
              // user is logged in and will be redirected to index ("Welcome user")
              // #########
              Ok(Json.toJson(Json.obj(
                "loginSuccess" -> true
              )))
                .withSession("username" -> loginData.username,
                "csrfToken" -> play.filters.csrf.CSRF.getToken.get.value)
              // #########
            } else {
              // user is not logged in and will be redirected to login
              Ok(Json.toJson(Json.obj(
                "loginSuccess" -> false,
                "error" -> "The username or password you entered is not valid."
              )))
                .withSession("csrfToken" -> play.filters.csrf.CSRF.getToken.get.value)
            }
          )
        }
        case e @ JsError(_) => Future.successful(Redirect(routes.AuthenticationController.index()))
      }
    }).getOrElse(Future.successful(Ok(Json.toJson(Json.obj("error" -> "Validation failed. Please retry.")))
    .withSession("csrfToken" -> play.filters.csrf.CSRF.getToken.get.value)))
  }

}
