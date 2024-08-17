module.exports = {
  apps: [
    {
      name: "NodeReactApp",
      script: "index.js",
      watch: ".",
      watch_delay: 1000,
      ignore_watch: ["node_modules", "logs", "mongodb", "uploads"],
    },
  ],

  deploy: {
    production: {
      ref: "origin/stage", // git branch reference
      repo: "git@gitlab.com:amymal/dock-tok-backend.git", // repository URL
      path: "/var/www/dock-tok-backend", // deployment path
      "post-deploy":
        "yarn install && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
    },
  },
};
