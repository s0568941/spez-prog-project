-- Users schema

-- !Ups

CREATE TABLE users (
                       id SERIAL PRIMARY KEY,
                       username varchar(20) NOT NULL,
                       password varchar(50) NOT NULL
);

CREATE TABLE stocks (
                        id SERIAL PRIMARY KEY,
                        user_id int4 NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        stocks text NOT NULL
);

CREATE TABLE news (
                      id varchar(20) NOT NULL,
                      date_of_request varchar(20) NOT NULL,
                      news text NOT NULL
);

-- !Downs

DROP TABLE users CASCADE;
DROP TABLE stocks CASCADE;
DROP TABLE news;