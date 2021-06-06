/* Table stores accounts of users */
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username varchar(20) NOT NULL,
    password varchar(50) NOT NULL
);

/* Table stores all available stocks and the watchlists of each user */
/*
user admin gets all the stocks which are available
each users gets own stock saved
stocks is of type text -
*/
CREATE TABLE stocks (
                       id SERIAL PRIMARY KEY,
                       user_id int4 NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                       stocks text NOT NULL
);

/* Table stores the news for all available stocks */
/*
to not exceed api request limit, one request per day is sent to receive
all the news data which is displayed for the user
*/
CREATE TABLE news (
                        id varchar(20) NOT NULL,
                        date_of_request varchar(20) NOT NULL,
                        news text NOT NULL
);
