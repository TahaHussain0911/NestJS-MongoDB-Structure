module.exports = {
  apps: [
    {
      name: 'nestjs-app',
      script: 'dist/main.js',
      cwd: '/var/www/nestjs-app',
      env_file: '.env',
    },
  ],
};