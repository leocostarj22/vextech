module.exports = {
  apps: [
    {
      name: "vextech-api",
      script: "src/server.js",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: 4001,
      },
    },
  ],
};
