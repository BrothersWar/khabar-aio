# tinkoff-start-example

## Angular Spotify Api Music Quiz

## About

This app was created as TFS-FRONTEND school final project. This app uses Spotify Api to get track URL's and related artists.

## Gameplay

You have 10 seconds select the artist of the track being played. You can surrender when you want and you will be able to pass your result to score table.

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

See this project in action:

[http://afisha10sec.herokuapp.com/](http://afisha10sec.herokuapp.com/)

![](https://i.ibb.co/F0dhnXx/collage.png)


# Credits

This app uses:
- [Angular](https://angular.io) as a front-end framework.
- [Express](https://github.com/expressjs/express) with [spotify-web-api-node](https://github.com/thelinmichael/spotify-web-api-node) for the server.
- [Spotify API](https://developer.spotify.com/web-api/) for the quiz data.
- [Angular Material](https://material.angular.io/) for styling.
- [Firebase](https://firebase.google.com/?hl=ru) to store Quiz results
