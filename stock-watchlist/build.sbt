name := """stock-watchlist"""
organization := "com.nassimuhrmann"

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.13.5"

libraryDependencies += guice
libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "5.0.0" % Test

herokuAppName in Compile := "sprog-stock-watchlist"

// Adds additional packages into Twirl
//TwirlKeys.templateImports += "com.nassimuhrmann.controllers._"

// Adds additional packages into conf/routes
// play.sbt.routes.RoutesKeys.routesImport += "com.nassimuhrmann.binders._"
