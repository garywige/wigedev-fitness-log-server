# WFL API Server

## Description

This is the API server for the WFL project located [here](https://github.com/garywige/wigedev-fitness-log). 

## NPM Scripts

- `npm run build`: transpiles the application
- `npm run start`: hosts the built application on port 3000
- `npm run style`: performs a style check using prettier
- `npm run style:fix`: automatically fixes style violations
- `npm run lint`: performs a lint check using eslint
- `npm run lint:fix`: automatically fixes lint violations
- `npm run test`: runs jasmine on any transpiled spec files
- `npm run docker:buildmongo`: builds docker image hosting the MongoDB database
- `npm run docker:runmongo`: runs the mongo docker image locally on port 27017
- `npm run docker:build`: builds docker image hosting the server project
- `npm run docker:run`: runs the server docker image locally on port 3000

## API Design

The interfaces were designed using OpenAPI 3.0 and the design file is named "api-design.yml" in the root of the project. You can use the Swagger Preview extension for VS Code to view the documentation.