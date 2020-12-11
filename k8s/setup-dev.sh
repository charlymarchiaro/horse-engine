# ingress controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.40.2/deploy/static/provider/cloud/deploy.yaml
kubectl delete -A ValidatingWebhookConfiguration ingress-nginx-admission

kubectl apply -f ingress-service.yaml

kubectl apply -f load-balancers/postgres-load-balancer.yaml
kubectl apply -f load-balancers/splash-load-balancer.yaml

kubectl apply -f dev/database-pvc.yaml

kubectl apply -f api-config-map.yaml
kubectl apply -f api-cluster-ip-service.yaml
kubectl apply -f dev/api-deployment.yaml
kubectl apply -f client-cluster-ip-service.yaml
kubectl apply -f dev/client-deployment.yaml
kubectl apply -f scrapyd-cluster-ip-service.yaml
kubectl apply -f dev/scrapyd-deployment.yaml
kubectl apply -f splash-cluster-ip-service.yaml
kubectl apply -f dev/splash-deployment.yaml
kubectl apply -f postgres-cluster-ip-service.yaml
kubectl apply -f dev/postgres-deployment.yaml

# Dashboard
kubectl apply -f dashboard/dashboard.yaml

# Creating sample user
# https://github.com/kubernetes/dashboard/blob/master/docs/user/access-control/creating-sample-user.md

# Creating a Service Account
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
EOF

# Creating a ClusterRoleBinding
cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
EOF

# Getting a Bearer Token
kubectl -n kubernetes-dashboard describe secret $(kubectl -n kubernetes-dashboard get secret | grep admin-user | awk '{print $1}')

read -p "Press enter to continue"