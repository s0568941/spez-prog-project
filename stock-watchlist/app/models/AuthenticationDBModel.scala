package models

import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext
import models.Tables._
import play.api.libs.json.Json

import java.text.SimpleDateFormat
import java.util.Calendar
import scala.concurrent.Future



class AuthenticationDBModel(db: Database)(implicit ec: ExecutionContext) {
  // TODO: set credentials for stock storage
  private val STOCK_STORAGE: String = "stockstorage"
  private val STOCK_STORAGE_PW: String = "stocks"


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

  def validateLogin(username: String, password: String): Future[Option[Int]] = {
    saveStocksIfNeeded()

    val resultingUsers: Future[Seq[Users#TableElementType]] = db.run(Users.filter(users =>
      users.username === username && users.password === password).result)
    // returns true if login is valid
    resultingUsers.map(users =>
      users.headOption.flatMap {
        user =>
          if (user.id != None) {
            Some(user.id)
          } else {
            None
          }
      }
    )
  }

  /**
   * Creates a stock storage user which will contain the app data (all available stocks)
   * @param id
   * @return
   */
  def createStockStorageIfNeeded(id: Int = 0): Future[Boolean] = {
    val stockStorageExists = db.run(Users.filter(users =>
      users.username === STOCK_STORAGE).result)
    stockStorageExists.flatMap(user =>
      if (user.nonEmpty) {
        Future.successful(true)
      } else {
        val insertStorage = db.run(Users += UsersRow(id, STOCK_STORAGE, STOCK_STORAGE_PW))
        insertStorage.map { insertCount =>
            insertCount > 0
        }
      }
    )
  }

  /**
   * This would be called everyday
   * Unfortunately, the news API does not allow to
   * do fetch requests when app does not run on localhost
   * @param news
   * @return
   */
  def saveTodaysNews(news: String): Future[Int] = {
    val format = new SimpleDateFormat("y-MM-dd")
    val todaysDate = format.format(Calendar.getInstance().getTime())
    // delete all old news entries
    db.run(News.filter(_.dateOfRequest =!= todaysDate.toString).delete)

    db.run(News += NewsRow("-1", todaysDate.toString, news))
  }

  def addStockToWatchlist(stock: String, userId: Int): Future[Int] = {
    db.run(Stocks += StocksRow(-1, userId, stock))
  }

  def removeStockFromWatchlist(stockId: Int): Future[Int] = {
    db.run(Stocks.filter(_.id === stockId).delete)
  }

  /**
   * This method saves all the stocks available on the app
   */
  def saveStocksAppData(stocks: String, userId: Int): Future[Int] = {
    db.run(Stocks += StocksRow(-1, userId, stocks: String))
  }

  def getTodaysNews() = {
    val format = new SimpleDateFormat("y-MM-dd")
    val todaysDate = format.format(Calendar.getInstance().getTime())

//    db.run(News.filter(_.dateOfRequest === todaysDate.toString).result)
    // News API does not allow fetching from heroku - therefore, only news from DB are used from 2021-06-06
    db.run(News.filter(_.dateOfRequest === "2021-06-06").result)
      .map(news =>
        news.map{ news => NewsItem(news.id.toString, news.dateOfRequest, news.news)})

  }

  def getStocks(username: String = STOCK_STORAGE) = {
    db.run(
      (for {
        user <- Users if user.username === username
        stock <- Stocks if stock.userId === user.id
      } yield {
        stock
      }).result
    ).map(stocks => stocks.map{ stocks => StocksItem(stocks.id, stocks.userId, stocks.stocks)})
  }

  /**
   * This method saves all the stocks which can be added to a watchlist by users
   * @return
   */
  def saveStocksIfNeeded() = {
    // define all stocks as a list
    // when validating call this method to save stocks
    val stocks: List[String] = List(
      "Amazon",
      "DoorDash",
      "Pepsi",
      "Facebook",
      "Netflix",
      "Tesla",
      "Daimler",
      "Oracle",
      "IBM",
      "Google",
      "Salesforce",
      "SAP",
      "Nintendo",
      "Sony",
      "Microsoft",
      "Apple",
      "Nike",
      "eBay",
      "Spotify",
      "Volkswagen",
      "Uber",
      "Samsung",
      "Huawei"
    )
    createStockStorageIfNeeded().map {
      stockStorageAvailable =>
        if (stockStorageAvailable) {
          val resultingUsers: Future[Seq[Users#TableElementType]] = db.run(Users.filter(users =>
            users.username === STOCK_STORAGE && users.password === STOCK_STORAGE_PW).result)
          val optStorageId = resultingUsers.map(users =>
            users.headOption.flatMap {
              user =>
                if (user.id != None) {
                  Some(user.id)
                } else {
                  None
                }
            }
          )

          optStorageId.map { storage =>
            storage match {
              case Some(storageId) =>
                // get stocks from storage
                getStocks().map {
                  stock =>
                    if (stock.isEmpty) saveStocksAppData(Json.toJson(stocks).toString, storageId)
                }
              case None =>
                None
            }
          }

        }
    }
  }

}
