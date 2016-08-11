# [on-your-marks](https://ig.ft.com/sites/on-your-marks)

[![Build Status][circle-image]][circle-url]

## Local

First time: make a `.env` file and put `SPREADSHEET_KEY` in it, set to the spreadsheet key for this project. Then do `npm run download-data`.

```
npm start
```

Build/compile, start a dev server and watch for changes.

# Deploy

1. Write code in a branch.
2. Make a PR. CI will automatically:
    * build and test the branch
    * deploy green builds to the review site
3. Do quick smoke testing of the review build
4. Get a code review. Once you get a thumbs up, merge into master.
5. CI will build, test and deploy a build to Production.


## Uses Starter Kit

This project was scaffolded with [Stater Kit @d11e97b](https://github.com/ft-interactive/starter-kit/tree/d11e97b).

## Licence
This software is published by the Financial Times under the [MIT licence](http://opensource.org/licenses/MIT).

Please note the MIT licence includes only the software, and does not cover any FT content made available using the software, which is copyright &copy; The Financial Times Limited, all rights reserved. For more information about re-publishing FT content, please contact our [syndication department](http://syndication.ft.com/).

<!-- badge URLs -->
[circle-url]: https://circleci.com/gh/ft-interactive/on-your-marks
[circle-image]: https://circleci.com/gh/ft-interactive/on-your-marks/tree/master.svg?style=shield
