import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
export const projectName = config.require("projectName");

const vpcName: string = `${projectName}-vpc`
const vpc = new aws.ec2.Vpc(vpcName, {
    cidrBlock: "10.0.0.0/16",
    tags: {
        Name: vpcName,
    },
});

const internetGatewayName: string = `${projectName}-internet-gateway`
const internetGateway = new aws.ec2.InternetGateway(internetGatewayName, {
    vpcId: vpc.id,
    tags: {
        Name: internetGatewayName,
    },
});

const subnetNameA = `${projectName}-subnet-a`
const subnetA = new aws.ec2.Subnet(subnetNameA, {
    vpcId: vpc.id,
    availabilityZone: "ap-northeast-1a",
    cidrBlock: "10.0.1.0/24",
    mapPublicIpOnLaunch: true,
    tags: {
        Name: subnetNameA,
    },
});

const subnetNameC = `${projectName}-subnet-c`
const subnetC = new aws.ec2.Subnet(subnetNameC, {
    vpcId: vpc.id,
    availabilityZone: "ap-northeast-1c",
    cidrBlock: "10.0.2.0/24",
    mapPublicIpOnLaunch: true,
    tags: {
        Name: subnetNameC,
    },
});

const routetableNameA: string = `${subnetNameA}-routetable`
const routetableA = new aws.ec2.RouteTable(routetableNameA, {
    vpcId: vpc.id,
    routes: [
        {
            cidrBlock: "0.0.0.0/0",
            gatewayId: internetGateway.id,
        },
    ],
    tags: {
        Name: routetableNameA,
    },
});

const routetableNameC: string = `${subnetNameC}-routetable`
const routetableC = new aws.ec2.RouteTable(routetableNameC, {
    vpcId: vpc.id,
    routes: [
        {
            cidrBlock: "0.0.0.0/0",
            gatewayId: internetGateway.id,
        },
    ],
    tags: {
        Name: routetableNameC,
    },
});
const routeTableAssociationA = new aws.ec2.RouteTableAssociation(`${subnetNameA}-rta`, {
    subnetId: subnetA.id,
    routeTableId: routetableA.id,
});
const routeTableAssociationC = new aws.ec2.RouteTableAssociation(`${subnetNameC}-rta`, {
    subnetId: subnetC.id,
    routeTableId: routetableC.id,
});


const eksClusterRole = new aws.iam.Role(`${projectName}-eks-cluster-role`, {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Sid: "",
            Principal: {
                Service: "eks.amazonaws.com",
            },
        }],
    }),
});
const eksClusterRoleAttach1 = new aws.iam.RolePolicyAttachment(`role-policy-attachment-eks-cluster-policy`, {
    role: eksClusterRole.name,
    policyArn: "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy",
});
const eksClusterRoleAttach2 = new aws.iam.RolePolicyAttachment(`role-policy-attachment-eks-service-policy`, {
    role: eksClusterRole.name,
    policyArn: "arn:aws:iam::aws:policy/AmazonEKSServicePolicy",
});

const eksWorkerRole = new aws.iam.Role(`${projectName}-eks-worker-role`, {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Sid: "",
            Principal: {
                Service: "ec2.amazonaws.com",
            },
        }],
    }),
});

const eksWorkerRoleAttach1 = new aws.iam.RolePolicyAttachment(`role-policy-attachment-eks-worker-node-policy`, {
    role: eksWorkerRole.name,
    policyArn: "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
});
const eksWorkerRoleAttach2 = new aws.iam.RolePolicyAttachment(`role-policy-attachment-eks-cni-policy`, {
    role: eksWorkerRole.name,
    policyArn: "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
});
const eksWorkerRoleAttach3 = new aws.iam.RolePolicyAttachment(`role-policy-attachment-ecr-readonly-policy`, {
    role: eksWorkerRole.name,
    policyArn: "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
});

const eksCluster = new aws.eks.Cluster(`${projectName}-eks-cluster`, {
    roleArn: eksClusterRole.arn,
    vpcConfig: {
        subnetIds: [subnetA.id, subnetC.id],
    },
}, {});

const nodeGroupName: string = `${projectName}-eks-nodegroup`
const nodeGroup = new aws.eks.NodeGroup(nodeGroupName, {
    clusterName: eksCluster.name,
    nodeRoleArn: eksWorkerRole.arn,
    subnetIds: [subnetA.id, subnetC.id],
    scalingConfig: {
        desiredSize: 2,
        maxSize: 2,
        minSize: 2,
    },
    nodeGroupName: nodeGroupName,
    diskSize: 10,
    instanceTypes: ["t3.micro"],
    updateConfig: {
        maxUnavailable: 1,
    },
}, {});
