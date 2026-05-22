const SwaggerTitle = 'API Documentation';
const SwaggerDescription = 'API Documentation of application';
const SwaggerJwtAuth = 'JWT-auth';
const SwaggerRefreshTokenAuth = 'JWT-refresh';

const SwaggerLocalServer = `http://localhost:3000`;
const SwaggerEc2Server = `https://98.91.191.130.nip.io`;
const SwaggerNgrokServer = `https://4a03-31-215-146-89.ngrok-free.app`;
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
  SwaggerEc2Server,
  SwaggerLocalServer,
  SwaggerNgrokServer,
  SwaggerCustomCss,
};
