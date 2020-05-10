docker build -t charlymarchiaro/horse-engine-client:latest -t charlymarchiaro/horse-engine-client:$SHA -f ./client/Dockerfile ./client
docker build -t charlymarchiaro/horse-engine-api:latest -t charlymarchiaro/horse-engine-api:$SHA -f ./api/Dockerfile ./api
docker build -t charlymarchiaro/horse-engine-postgres:latest -t charlymarchiaro/horse-engine-postgres:$SHA -f ./postgres/Dockerfile ./postgres
docker build -t charlymarchiaro/horse-engine-scrapyd:latest -t charlymarchiaro/horse-engine-scrapyd:$SHA -f ./scrapyd/Dockerfile ./scrapyd

docker push charlymarchiaro/horse-engine-client:latest
docker push charlymarchiaro/horse-engine-api:latest
docker push charlymarchiaro/horse-engine-postgres:latest
docker push charlymarchiaro/horse-engine-scrapyd:latest

docker push charlymarchiaro/horse-engine-client:$SHA
docker push charlymarchiaro/horse-engine-api:$SHA
docker push charlymarchiaro/horse-engine-postgres:$SHA
docker push charlymarchiaro/horse-engine-scrapyd:$SHA

kubectl apply -f k8s
kubectl set image deployments/client-deployment client=charlymarchiaro/horse-engine-client:$SHA
kubectl set image deployments/api-deployment api=charlymarchiaro/horse-engine-api:$SHA
kubectl set image deployments/postgres-deployment postgres=charlymarchiaro/horse-engine-postgres:$SHA
kubectl set image deployments/scrapyd-deployment scrapyd=charlymarchiaro/horse-engine-scrapyd:$SHA