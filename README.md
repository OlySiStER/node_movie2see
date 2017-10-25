# movie2see

movie2see is a website to watch online movies.

Go to website >> https://movie2see.herokuapp.com/

Package/module required

    "body-parser": "^1.18.2",
    "express": "^4.16.2",
    "express-session": "^1.15.6",
    "hbs": "^4.0.1",
    "json-server": "^0.12.0",
    "moment": "^2.19.1",
    "password-hash": "^1.2.2"
    
You can get by open Power shell or CMD on home directory and run command (home directory is __directory\movie2see)
  - npm i -g json-server
  - npm i --save body-parser express express-session hbs password-hash
    
How to use?
1. Open Power shell or CMD on home directory and run command "json-server --watch db.json"
2. Open new Power shell or CMD on home directory and run command "node server.js"
3. Open web browser and go to http://localhost:3001/

Condition!
1. You must be a member of our website. If you are new for movie2see, you can register at http://localhost:3001/signup
2. You need to login before view the movie.

ID for test our website
- Admin --> UID: admin, Pass: asdfasdf
- User  --> UID: user, Pass: asdfasdf
    
Developed by Suphachok Noopan 5730211009
