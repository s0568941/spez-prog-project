package models

case class LoginData(username: String, password: String)
case class RegisterData(username: String, password: String, confirmPassword: String)
