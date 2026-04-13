# E-Commerce MVP Ecosystem (NestJS & MongoDB)

A full-featured Backend E-Commerce REST API & Real-time communication system built using [NestJS](https://nestjs.com/) and MongoDB (Mongoose).

## Features

- **Store Architecture**: Management of `Product`, `Category`, `Cart`, and `Order` ecommerce related flow.
- **User Engagement & Social**: Add `Comment`s and `Like`s on items.
- **Authentication**: JWT-based Authentication,reset password functionality with OTP generation, validation, and account security via `passport-jwt`.
- **Real-Time Chat & Communications**:
  - Live bi-directional sockets via [Socket.io](https://socket.io).
  - Isolated conversational `Room`s.
  - chat capabilities: Typing indicators, unread message counts, and read message.
- **Media Uploads**: Built-in AWS S3 (`@aws-sdk/client-s3`) support to handle file uploads both with signed url and buffer.
- **Payment Processing**: Integrated with [Stripe](https://stripe.com/) for checkout handling.
- **Mailer functionality**: Sends templated emails (Payment success, OTP) with `nodemailer` and `ejs` templates.
- **API Documentation**: Swagger documentation endpoints UI.

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (Node.js)
- **Database**: MongoDB (via `mongoose`)
- **Real-Time Engine**: [Socket.io](https://socket.io) (`@nestjs/platform-socket.io`)
- **Security & Validation**: `bcrypt`, `class-validator`, `zod`
- **Integrations**: AWS S3 (Storage), Stripe (Payments)

## Installation

```bash
$ npm install
```

## Running the app

Ensure you have your environment variables set correctly (e.g., MongoDB URI, AWS Credentials, Stripe Keys, JWT secrets) before starting the server.

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Documentation

When the application is running, the Swagger UI API documentation can be accessed by `http://localhost:3001/api/v1/docs`) in your browser.
