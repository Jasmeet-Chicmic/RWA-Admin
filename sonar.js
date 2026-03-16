const scanner = require("sonarqube-scanner");

scanner(
  {
    serverUrl: "http://localhost:9000",
    token: "sqp_66fae0a11865b05effe4b4deb3eec728b1488fa2",
    options: {
      "sonar.projectKey": "raypto-admin-frontend",
      "sonar.sources": "src",
    },
  },
  () => process.exit(),
);
