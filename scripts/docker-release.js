import { execSync } from 'child_process';
import data from '../package.json' with { type: 'json' };

// Main function to orchestrate the script execution
function main() {
  if (!data.version) {
    console.error("Error: No version found in package.json. Please specify a version.");
    process.exit(1);
  }
  buildAndPushDockerImage(data.version);
}

// Function to build and push the Docker image
function buildAndPushDockerImage(APP_VERSION_TAG) {
  const imageVersionTag = `zukzuk/calendar-ux:${APP_VERSION_TAG}`;
  const imageLatestTag = `zukzuk/calendar-ux:latest`;
  try {
    console.log("Building Docker release image...");
    execSync(`docker build -f scripts/Dockerfile.release --build-arg APP_VERSION_TAG=${APP_VERSION_TAG} -t ${imageVersionTag} -t ${imageLatestTag} .`, { stdio: 'inherit' });
    console.log(`Pushing '${APP_VERSION_TAG}' and 'latest' to Docker registry...`);
    execSync(`docker push ${imageVersionTag}`, { stdio: 'inherit' });
    execSync(`docker push ${imageLatestTag}`, { stdio: 'inherit' });
    console.log(`Docker release image built and tagged with both ${APP_VERSION_TAG} and 'latest' successfully.`);
  } catch (error) {
    console.error("Error during Docker build or push:", error.message);
    process.exit(1);
  }
}

main();
