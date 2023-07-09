import * as cdk from 'aws-cdk-lib';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Cluster, ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { Construct } from 'constructs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = Vpc.fromLookup(this, "VpcReference", {
      vpcId: "vpc-0c7acc4f117d4b18c"
    })

    const cluster = Cluster.fromClusterAttributes(this, "ClusterRef", {
      clusterName: "fargate-fun-cluster",
      clusterArn: `arn:aws:ecs:us-east-1:${cdk.Aws.ACCOUNT_ID}:cluster/fargate-fun-cluster`,
      vpc
    })

    const securityGroup = SecurityGroup.fromLookupById(this, "SGRef", "sg-04a436db0880c3f3a")

    const service = new ApplicationLoadBalancedFargateService(this, "TestRustFargateService", {
      cluster,
      loadBalancerName: "fargate-fun-loadbalancer",
      cpu: 256,
      securityGroups: [securityGroup],
      desiredCount: 1,
      memoryLimitMiB: 512,
      taskImageOptions: {
        image: ContainerImage.fromEcrRepository(
          Repository.fromRepositoryName(this, "ImageRepository", process.env.REPO_NAME || "bogus"),
          "latest"
        ),
        containerPort: 80
      }
    })

    service.targetGroup.configureHealthCheck({ 
      path: "/health",
      port: "80"
    })
  }
}

