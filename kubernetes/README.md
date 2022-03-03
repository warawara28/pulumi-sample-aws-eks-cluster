# kubernetes

=======

## Preparation

### 1. install npm packages

Run this command to install npm packages.

```console
npm install
```

### 2. create kubeconfig

See [Create a kubeconfig for Amazon EKS - Amazon EKS](https://docs.aws.amazon.com/eks/latest/userguide/create-kubeconfig.html) and create kubeconfig with eks-cluster-name.

```console
aws eks update-kubeconfig --region <your-region> --profile pulumi-sample --name <created-eks-cluster-name>
```

### 3. set config

Run this command.

```console
pulumi config set aws:profile <your-profile>
pulumi config set aws:region <your-region>
pulumi config set pulumi-sample-kubernetes:serviceName pulumi-sample-service
```

## Deploy

```console
pulumi up
```

If you want to destroy all resources, run this below command.

```console
pulumi destroy
```
