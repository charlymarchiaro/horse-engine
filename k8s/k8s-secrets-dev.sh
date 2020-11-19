kubectl create secret generic pgadmin-default-email --from-literal PGADMIN_DEFAULT_EMAIL=carlosmarchiaro@gmail.com
kubectl create secret generic pgadmin-default-password --from-literal PGADMIN_DEFAULT_PASSWORD=superclave
kubectl create secret generic pgpassword --from-literal PGPASSWORD=superclave

# scrapoxy
kubectl create secret generic scrapoxy-password --from-literal SCRAPOXY_PASSWORD=superclave
kubectl create secret generic scrapoxy-do-token --from-literal SCRAPOXY_DO_TOKEN=1234
kubectl create secret generic scrapoxy-ip-address --from-literal SCRAPOXY_IP_ADDRESS=1.1.1.1
