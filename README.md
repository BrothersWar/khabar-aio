# tinkoff-start-example

## About

Этот репозиторий создан для показа самого сложного проекта, который я реализовывал.

## Суть проекта

Проект создавался с целью автомотизировать действия для покупки лимитированных кроссовок. Это достигалось путем создания десятков уникальных тасков (грубо говоря 1 таск - 1 человек, покупающий кроссовки) и выполнением серии запросов в каждом из тасков.

## Quickstart

```sh
$ git clone git@gitlab.com:BrothersWar/afisha-angular.git
$ cd afisha-angular/afisha
$ git checkout startBranch
$ npm install
$ ng serve
$ split terminal
$ cd node_server
$ node app.js
```

- Create a application at https://developer.spotify.com/my-applications.
- You will recieve a client id and client secret for your application. 
- Remove "_EXAMPLE" on environment_EXAPMLE.ts, environment.prod_EXAPMLE.ts, .env_EXAMPLE
- Insert your client id and client secret to node_server/.env

# Live Example

![](https://i.ibb.co/cbvqBxF/bot-wind.png)


# Credits

This app uses:
- [Angular](https://angular.io) as a front-end framework.
- [Express](https://github.com/expressjs/express) with [spotify-web-api-node](https://github.com/thelinmichael/spotify-web-api-node) for the server.
- [Spotify API](https://developer.spotify.com/web-api/) for the quiz data.
- [Angular Material](https://material.angular.io/) for styling.
- [Firebase](https://firebase.google.com/?hl=ru) to store Quiz results
