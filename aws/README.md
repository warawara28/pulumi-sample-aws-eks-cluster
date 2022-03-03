# aws

=======

## Preparation

### 1. install npm packages

Run this command to install npm packages.

```console
npm install
```

### 2. set config

Run this command.

```console
pulumi config set aws:profile <your-profile>
pulumi config set aws:region <your-region>
pulumi config set pulumi-sample-aws:projectName pulumi-sample-project
```

## Deploy

```console
pulumi up
```

If you want to destroy all resources, run this below command.

```console
pulumi destroy
```
