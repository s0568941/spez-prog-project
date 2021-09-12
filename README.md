# spez-prog-project

This app will enable you to store your favorite stocks and check all relevant news about each one of them to make the best choice when investing.

# Run on Localhost
For Java version: openjdk version "1.8.0_292" (on Mac OS)<br>

1) Create database:<br>
Run the sql commands in `stock-watchlist/conf/sql/database.sql` to create the database which is supposed to be connected to the application by default. (see `stock-watchlist/conf/application.conf`)<br>
2) Create the tables:<br>
Connect to your DB: `psql -h localhost -p 5432 -U s0568941 stockwatchlist` <br>
Run the sql commands in `stock-watchlist/conf/sql/tables.sql` (or `stock-watchlist/conf/evolutions/default/1.sql` respectively).<br>
3) Import the necessary data:<br>
Import tables which contain the stocks as well as the news which were fetched from the news API on 2021/06/06. <br>
`cd` into `stock-watchlist/conf/sql`<br>
Run following commands with connection to your postgres DB:<br>
 `\copy users FROM 'users_table.csv' delimiter '^';`<br>
 `\copy stocks FROM 'stocks_table.csv' delimiter '^';`<br>
 `\copy news FROM 'news_table.csv' delimiter '^';`<br>

The reason behind this is, that the news API does not allow fetch requests which come from the browser (e.g. from Heroku), unless a premium account is used. Therefore, the data has been fetched via localhost and persisted in the database.<br>

# View it on Heroku

Go to: http://sprog-stock-watchlist.herokuapp.com/
