import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const config = new pulumi.Config();
const serviceName = pulumi.getProject();

const deploymentName = `${serviceName}-deployment`
const appLabels = { app: deploymentName }
const deployment = new k8s.apps.v1.Deployment(deploymentName, {
    metadata: {
        name: deploymentName,
        labels: appLabels,
    },
    spec: {
        replicas: 2,
        selector: { matchLabels: appLabels },
        template: {
            metadata: { labels: appLabels },
            spec: {
                containers: [{
                    name: deploymentName,
                    image: "public.ecr.aws/nginx/nginx:1.21",
                    ports: [{ name: "http", containerPort: 80 }],
                    imagePullPolicy: "IfNotPresent",
                }],
            }
        }
    },
});

const k8sServiceName = `${serviceName}-service`
const service = new k8s.core.v1.Service(k8sServiceName, {
    metadata: {
        name: k8sServiceName,
        labels: appLabels,
    },
    spec: {
        type: "LoadBalancer",
        selector: appLabels,
        ports: [{ protocol: "TCP", port: 80, targetPort: "http" }],
    },
}, {
    dependsOn: deployment,
});
export const loadBalancerHost = service.status.loadBalancer.ingress[0].hostname;
