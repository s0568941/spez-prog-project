package models

//TODO: This model needs to be replaced by a model with DB access
object AuthenticationModel {
  private val dummyUser = "test"
  private val dummyPassword = "test123"

  def validateLogin(username: String, password: String): Boolean = {
    username == dummyUser && password == dummyPassword
  }

  def registerUser(username: String, password: String): Boolean = {
    !(username == dummyUser)
  }

}
