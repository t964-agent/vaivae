const { initializeSentry } = require("./src/lib/sentry") as {
  initializeSentry: () => void;
};

initializeSentry();

function register(): void {
  // Medusa loads this file during boot; Sentry must initialize before app modules run.
}

module.exports = { register };
