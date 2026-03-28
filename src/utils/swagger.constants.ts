const SwaggerTitle = 'API Documentation';
const SwaggerDescription = 'API Documentation of application';
const SwaggerJwtAuth = 'JWT-auth';
const SwaggerRefreshTokenAuth = 'JWT-refresh';
const SwaggerDevelopmentServer = `http://localhost:3001`;
const SwaggerCustomCss = `
      .swagger-ui .topbar {display: none}
      .swagger-ui .info { margin: 50px 0; }
      .swagger-ui .info .title {color: #4A90E2;}
    `;

export {
  SwaggerTitle,
  SwaggerDescription,
  SwaggerJwtAuth,
  SwaggerRefreshTokenAuth,
  SwaggerDevelopmentServer,
  SwaggerCustomCss,
};
