name := """stock-watchlist"""
organization := "com.nassimuhrmann"

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.13.5"

libraryDependencies += guice
libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "5.0.0" % Test

herokuAppName in Compile := "sprog-stock-watchlist"

// https://www.playframework.com/documentation/2.8.x/AccessingAnSQLDatabase#Accessing-the-JDBC-datasource
//  https://www.playframework.com/documentation/2.8.x/PlaySlick#Usage
libraryDependencies ++= Seq(
  "com.typesafe.play" %% "play-slick" % "5.0.0",
  "com.typesafe.play" %% "play-slick-evolutions" % "5.0.0",
  "com.typesafe.slick" %% "slick-codegen" % "3.3.3"
)
// DB dependencies
libraryDependencies ++= Seq(
//  jdbc, //jdbc is not needed as slick is installed
  "org.postgresql" % "postgresql" % "42.2.20"
)

// Adds additional packages into Twirl
//TwirlKeys.templateImports += "com.nassimuhrmann.controllers._"

// Adds additional packages into conf/routes
// play.sbt.routes.RoutesKeys.routesImport += "com.nassimuhrmann.binders._"
