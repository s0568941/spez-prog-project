package controllers

import models.{AuthenticationDBModel, LoginData, NewsItem, RegisterData, StocksItem}
import play.api.data.Form
import play.api.data.Forms.{mapping, text}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.json.OFormat.oFormatFromReadsAndOWrites
import play.api.libs.json.{JsArray, JsError, JsSuccess, JsValue, Json, Writes}
import play.api.mvc._
import slick.jdbc.JdbcProfile

import javax.inject._
import scala.concurrent.{ExecutionContext, Future}



@Singleton
class AuthenticationDBController @Inject()(protected val dbConfigProvider: DatabaseConfigProvider, cc: MessagesControllerComponents)(
  implicit ec: ExecutionContext
) extends MessagesAbstractController(cc)
  with HasDatabaseConfigProvider[JdbcProfile] {
  val USERNAME_MIN_LEN = 3
  val USERNAME_MAX_LEN = 20
  val PASSWORD_MIN_LEN = 5
  val registerForm = Form(mapping(
    "username" -> text(USERNAME_MIN_LEN, USERNAME_MAX_LEN),
    "password" -> text(PASSWORD_MIN_LEN),
    "confPassword" -> text(PASSWORD_MIN_LEN))(Register.apply)(Register.unapply))
  private val model = new AuthenticationDBModel(db)

  implicit val loginDataReads = Json.reads[LoginData]

  implicit val registerDataReads = Json.reads[RegisterData]
  implicit val registerDataWrites = Json.writes[RegisterData]
  implicit val registerFormWrites = Json.writes[Register]
  implicit val stockRowWrites = Json.writes[StocksItem]
  implicit val newsRowWrites = Json.writes[NewsItem]

  def validateRegisterForm() = Action.async { implicit request: MessagesRequest[AnyContent] =>
    registerForm.bindFromRequest.fold(
      formWithErrors => {
        println(formWithErrors.errors)
        val fieldLengthErrors = formWithErrors.errors.map( e =>
          Json.obj(
            "field" -> e.key,
            "message" -> e.format
          )
        )
        val fieldRequiredErrors = formWithErrors.data.filter ( key =>
          key._2.equals("")
          )
        Future.successful(Ok(Json.toJson(Json.obj(
          "registerSuccess" -> false,
          "fieldRequiredError" -> fieldRequiredErrors,
          "fieldLengthError" -> fieldLengthErrors
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
            validUser match {
              case Some(userId) =>
                // user is logged in and will be redirected to index ("Welcome user")
                // #########
                Ok(Json.toJson(Json.obj(
                  "loginSuccess" -> true
                )))
                  .withSession("username" -> loginData.username,
                  "userId" -> userId.toString,
                  "csrfToken" -> play.filters.csrf.CSRF.getToken.get.value)

              // #########
              case None =>
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

  /**
   * Loads all available stocks for the app from the database as a json string
   * @return
   */
  def loadAppData() = Action.async { implicit request: Request[AnyContent] =>
    // stocks is an array
    model.getStocks().map {
      stocks =>
        Ok(Json.toJson(Json.obj("loadSuccess" -> true, "stocks" -> stocks)))
    }
  }

  def loadWatchlist() = Action.async { implicit request: Request[AnyContent] =>
    val user = request.session.get("username")
    val username = user.map { userName => userName }
    model.getStocks(username.getOrElse("")).map {
      stocks =>
        Ok(Json.toJson(Json.obj("loadSuccess" -> true, "stocks" -> stocks)))
    }
  }

  def receiveTodaysNews() = Action.async { implicit request: Request[AnyContent] =>
      model.getTodaysNews().map {
        news =>
          if (news.isEmpty) {
            Ok(Json.toJson(Seq.empty[String]))
          } else {
            Ok(Json.toJson(news))
          }
      }
  }

  def saveTodaysNews() = Action.async { implicit request: MessagesRequest[AnyContent] =>
    val optUserId = request.session.get("userId")
    val values = request.body.asJson
    optUserId.map{
      validUser =>
        values.map(vals => {
          Json.fromJson[JsValue](vals) match {
            case JsSuccess(news, path) => {
              Future.successful(Ok(Json.toJson(Json.obj("error" -> "News API does not allow fetching from heroku"))))
//              model.saveTodaysNews(news.toString).map(insertCount =>
//                Ok(Json.toJson(insertCount > 0))
//              )
            }
            case e @ JsError(err) =>
              Future.successful(Ok(Json.toJson(JsError.toJson(err))))
          }
        }).getOrElse(Future.successful(Ok(Json.toJson(Json.obj("error" -> "Adding news failed.")))))
    }.getOrElse(Future.successful(Ok(Json.toJson(Json.obj("error" -> "Adding news failed.")))))
  }

  /**
   * Adds requested stock to watchlist of user by determining the user ID
   * @return
   */
  def addStockToWatchlist() = Action.async { implicit request: MessagesRequest[AnyContent] =>
    val optUserId = request.session.get("userId")
    val values = request.body.asJson
    val id = optUserId.map(userId => userId.toInt)
    optUserId.map {
      userId =>
        values.map(vals => {
          Json.fromJson[String](vals) match {
            case JsSuccess(stock, path) => {
              model.addStockToWatchlist(stock, id.getOrElse(-1))
                .map(insertCount =>
                  Ok(Json.toJson(insertCount > 0))
                )
            }
            case e @ JsError(_) => Future.successful(Redirect(routes.AuthenticationController.index()))
          }
        }
        ).getOrElse(Future.successful(Ok(Json.toJson(Json.obj("error" -> "Adding stock to watchlist failed.")))))
    }.getOrElse(Future.successful(Ok(Json.toJson(Json.obj("error" -> "User not logged in.")))))
  }

  def removeStockFromWatchlist() = Action.async { implicit request: MessagesRequest[AnyContent] =>
    val optUserId = request.session.get("userId")
    val values = request.body.asJson
    // if no ID provided: stocks will not be modified
    val id = optUserId.map(userId => userId.toInt).getOrElse(Future.successful(Ok(Json.toJson(false))))
    values.map(vals => {
      Json.fromJson[Int](vals) match {
        case JsSuccess(stock, path) => {
          model.removeStockFromWatchlist(stock)
            .map(insertCount =>
              Ok(Json.toJson(insertCount > 0))
            )
        }
        case e @ JsError(_) =>
          Future.successful(Redirect(routes.AuthenticationController.index()))
      }
    }
    ).getOrElse(Future.successful(Ok(Json.toJson(Json.obj("error" -> "Removing stock from watchlist failed.")))))
  }

}
