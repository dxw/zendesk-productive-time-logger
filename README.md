![CI Status](https://github.com/dxw/zendesk-productive-time-logger/workflows/CI/badge.svg) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

# Zendesk Productive time logger

A Zendesk app for logging time spent on a ticket to Productive.

Most Zendesk tickets have a tag that looks like `project-ccw`. The app looks up this tag in our Project Knowledgebase Airtable and retrieves a link to the corresponding project in Productive. It uses this to look up the project in Productive and identifies the active support budget and the time spent on it so far. This information is displayed to the user along with a form for logging time. When the form is submitted, a new time entry is added in Productive with the ticket reference and a link back to the ticket on Zendesk.

## Prerequisites

To run the app locally, you'll need to have the following installed:

* Ruby 2.x
* Node.js 12.13.0 or greater

## Getting started

### Clone the repo

```bash
git clone git@github.com:dxw/zendesk-productive-time-logger.git
```

### Run the setup task

```bash
script/setup
```

### Add the username and password to the .zat file (optional)

Necessary if you want to run the server, but not if all you want is to run the test suite.

Where "username" is your Zendesk login with `/token` appended to the end (e.g. `foo@dxw.com/token`), and "password" is
available in the dxw 1Password as "Zendesk API Key".

## Running the server locally

```bash
script/server
```

You'll need the Airtable API key and base id, as well as the Productive API key and org id (all available from the dxw 1Password).

### Access a ticket

Go to a ticket in Zendesk and append `?zat=true` to the url. eg:

```
https://dxw.zendesk.com/agent/tickets/123345?zat=true
```

Click on the `Apps` button on the ticket view to see the app in action!

If the sidebar will not load, check the console. If you see a request to https://localhost and an error about SSL, then you may need to make changs in your browser to enable this ([for Chrome see here](https://stackoverflow.com/a/59452249/3356802).

## Running the tests

Jest is used for testing, and all tests, mocks, and fixtures are in the `spec` folder.

Run the following script:

```
script/test
```

## Building and updating the app

The bulk of the app's logic is in `app.js` and the HTML is in `default.js`.

To rebuild the app locally following changes, run

```
script/build
```

to build the app in the `/dist` folder using [Webpack](https://webpack.js.org/), and generate a zip file of the
project in `dist/tmp`.

The repo is set up to automatically push to Zendesk on every `main` push, but in case you want to
do this manually and push the updated package to Zendesk, you can run:

```
script/build --push
```

This assumes you have the correct credentials in your `.zat` file.