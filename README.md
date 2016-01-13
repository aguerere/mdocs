An opensource markdown-powered and collaborative editor inspired in google docs.

This project was created to show [auth0](http://auth0.com) and because we wanted to have something like google docs with markdown support.

Collaborative means that you can edit a document with a remote partner at the same time and you can also share documents just as you would do with google docs.

You can also register your company or organization for free and share documentes company-wide. This is the use case we wanted to show with [Auth0](http://auth0.com).

## Env variables

-  ```DB```: mongodb connection string in uri format (eg: ```mongodb://localhost/database```).
-  ```BASE_URL```: base url of the web app, (eg ```https://dasdsa.herokuapp.com/```). This is optional, default value is http://localhost:8080/
-  ```AUTH0_CLIENT_ID```: take this settings from your auth0 dashboard
-  ```AUTH0_CLIENT_SECRET```: take this settings from your auth0 dashboard
-  ```AUTH0_DOMAIN```: take this settings from your auth0 dashboard

If you want to be able to allow companies with google apps to register, you should register your application on the [google api console](https://code.google.com/apis/console/b/0/) and register the credentials in your auth0 dashboard.

## Run locally

Once you cloned this repository locally, you need to install the dependencies:

	npm install

Then you have to run as follows

~~~
DB=X \
ANOTHER_ENV=Y \
... \
npm start
~~~

Alternatively you can install the foreman ruby gem and use ```foreman start```, first creating a ```.env``` file in the root as follows:

~~~
PORT=8080
DB=X
ANOTHER_ENV=Y
...
~~~

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
