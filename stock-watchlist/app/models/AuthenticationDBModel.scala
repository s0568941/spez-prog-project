package models

import slick.jdbc.PostgresProfile.api._
import scala.concurrent.ExecutionContext
import models.Tables._
import scala.concurrent.Future

class AuthenticationDBModel(db: Database)(implicit ec: ExecutionContext) {

  // TODO: complete implementation for DB operations

  def registerUser(username: String, password: String): Future[Boolean] = {
    val resultingUsers = db.run(Users.filter(_.username === username).result)
    resultingUsers.flatMap { userRows =>
      if (userRows.isEmpty) {
        db.run(Users += UsersRow(-1, username, password))
          .map { insertCount =>
            insertCount > 0
            // insertion could still fail
          }
      } else {
        Future.successful(false)
      }
    }
  }

  def validateLogin(username: String, password: String): Future[Boolean] = {
//    val resultingUsers = db.run(Users.filter(_.username === username && _.password === password).result)
    val resultingUsers: Future[Seq[Users#TableElementType]] = db.run(Users.filter(users =>
      users.username === username && users.password === password).result)
    // returns true if login is valid
    resultingUsers.map(users => users.nonEmpty)
  }

}
