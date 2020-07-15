SHA=$(git rev-parse HEAD)

docker build -t charlymarchiaro/horse-engine-splash:latest -t charlymarchiaro/horse-engine-splash:$SHA -f ./Dockerfile .
docker push charlymarchiaro/horse-engine-splash:latest
docker push charlymarchiaro/horse-engine-splash:$SHA