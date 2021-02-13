SHA=$(git rev-parse HEAD)

docker build -t charlymarchiaro/horse-engine-postgres:latest -t charlymarchiaro/horse-engine-postgres:$SHA -f ./Dockerfile .
docker push charlymarchiaro/horse-engine-postgres:latest
docker push charlymarchiaro/horse-engine-postgres:$SHA