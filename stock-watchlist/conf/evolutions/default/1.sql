-- Users schema

-- !Ups

CREATE TABLE users (
                       id SERIAL PRIMARY KEY,
                       username varchar(20) NOT NULL,
                       password varchar(50) NOT NULL
);

-- !Downs

DROP TABLE users;