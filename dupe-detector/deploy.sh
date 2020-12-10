SHA=$(git rev-parse HEAD)

docker build -t charlymarchiaro/horse-engine-dupe-detector:latest -t charlymarchiaro/horse-engine-dupe-detector:$SHA -f ./Dockerfile .
docker push charlymarchiaro/horse-engine-dupe-detector:latest
docker push charlymarchiaro/horse-engine-dupe-detector:$SHA
