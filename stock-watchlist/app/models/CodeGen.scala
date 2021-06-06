package models

/**
 * Generates slick code for local DB
 */
object CodeGen extends App {
  slick.codegen.SourceCodeGenerator.run(
    "slick.jdbc.PostgresProfile",
    "org.postgresql.Driver",
    "jdbc:postgresql://localhost/stockwatchlist?user=s0568941&password=stock123",
    "/Users/i538356/Desktop/Uni/Semester 6/Spez Programmierung/coding/spez-prog-project/stock-watchlist/app/",
    "models", None, None, true, false
  )
}
