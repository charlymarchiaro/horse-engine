SHA=$(git rev-parse HEAD)

docker build -t charlymarchiaro/horse-engine-client:latest -t charlymarchiaro/horse-engine-client:$SHA -f ./client/Dockerfile ./client
docker build -t charlymarchiaro/horse-engine-api:latest -t charlymarchiaro/horse-engine-api:$SHA -f ./api/Dockerfile ./api
# docker build -t charlymarchiaro/horse-engine-postgres:latest -t charlymarchiaro/horse-engine-postgres:$SHA -f ./postgres/Dockerfile ./postgres
# docker build -t charlymarchiaro/pgadmin:latest -t charlymarchiaro/pgadmin:$SHA -f ./pgadmin/Dockerfile ./pgadmin
docker build -t charlymarchiaro/horse-engine-scrapyd:latest -t charlymarchiaro/horse-engine-scrapyd:$SHA -f ./scrapyd/Dockerfile ./scrapyd

docker push charlymarchiaro/horse-engine-client:latest
docker push charlymarchiaro/horse-engine-api:latest
# docker push charlymarchiaro/horse-engine-postgres:latest
# docker push charlymarchiaro/pgadmin:latest
docker push charlymarchiaro/horse-engine-scrapyd:latest

docker push charlymarchiaro/horse-engine-client:$SHA
docker push charlymarchiaro/horse-engine-api:$SHA
# docker push charlymarchiaro/horse-engine-postgres:$SHA
# docker push charlymarchiaro/pgadmin:$SHA
docker push charlymarchiaro/horse-engine-scrapyd:$SHA

# Decrypt Kubernetes cluster certificate
echo "$KUBERNETES_CLUSTER_CERTIFICATE" | base64 --decode > cert.crt

# Decrypt service-account.json.enc file
openssl aes-256-cbc -K $encrypted_069e8a6480f9_key -iv $encrypted_069e8a6480f9_iv -in cicd-token.txt.enc -out cicd-token.txt -d
KUBERNETES_TOKEN=$(<cicd-token.txt)


# # Apply k8s files
# kubectl \
#   --kubeconfig=/dev/null \
#   --server=$KUBERNETES_SERVER \
#   --certificate-authority=cert.crt \
#   --token=$KUBERNETES_TOKEN \
#     apply -f k8s


# # Set images

# client
kubectl \
  --kubeconfig=/dev/null \
  --server=$KUBERNETES_SERVER \
  --certificate-authority=cert.crt \
  --token=$KUBERNETES_TOKEN \
  set image deployments/client-deployment client=charlymarchiaro/horse-engine-client:$SHA

# api
kubectl \
  --kubeconfig=/dev/null \
  --server=$KUBERNETES_SERVER \
  --certificate-authority=cert.crt \
  --token=$KUBERNETES_TOKEN \
  set image deployments/api-deployment api=charlymarchiaro/horse-engine-api:$SHA

# # postgres
# kubectl \
#   --kubeconfig=/dev/null \
#   --server=$KUBERNETES_SERVER \
#   --certificate-authority=cert.crt \
#   --token=$KUBERNETES_TOKEN \
#   set image deployments/postgres-deployment postgres=charlymarchiaro/horse-engine-postgres:$SHA

# # pgadmin
# kubectl \
#   --kubeconfig=/dev/null \
#   --server=$KUBERNETES_SERVER \
#   --certificate-authority=cert.crt \
#   --token=$KUBERNETES_TOKEN \
#   set image deployments/pgadmin-deployment pgadmin=charlymarchiaro/pgadmin:$SHA

# scrapyd
kubectl \
  --kubeconfig=/dev/null \
  --server=$KUBERNETES_SERVER \
  --certificate-authority=cert.crt \
  --token=$KUBERNETES_TOKEN \
  delete deployment scrapyd-deployment
kubectl \
  --kubeconfig=/dev/null \
  --server=$KUBERNETES_SERVER \
  --certificate-authority=cert.crt \
  --token=$KUBERNETES_TOKEN \
  apply -f k8s/scrapyd-deployment.yaml
# kubectl \
#   --kubeconfig=/dev/null \
#   --server=$KUBERNETES_SERVER \
#   --certificate-authority=cert.crt \
#   --token=$KUBERNETES_TOKEN \
#   set image deployments/scrapyd-deployment scrapyd=charlymarchiaro/horse-engine-scrapyd:$SHA