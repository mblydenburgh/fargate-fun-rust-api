import * as cdk from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Cluster, ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { Construct } from 'constructs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = Vpc.fromLookup(this, "VpcReference", {
      vpcId: "vpc-0ed968b03f671abf6"
    })

    const cluster = Cluster.fromClusterAttributes(this, "ClusterRef", {
      clusterName: "test_cluster",
      clusterArn: "arn:aws:ecs:us-east-1:415023725722:cluster/test_cluster",
      vpc
    })

    new ApplicationLoadBalancedFargateService(this, "TestFargateService1", {
      cluster,
      cpu: 256,
      desiredCount: 2,
      memoryLimitMiB: 512,
      taskImageOptions: { image: ContainerImage.fromRegistry("amazon/amazon-ecs-sample") }
    })
//     const service = new ApplicationLoadBalancedFargateService(this, "TestFargateService", {
//       cluster,
//       cpu: 256,
//       desiredCount: 2,
//       memoryLimitMiB: 512,
//       taskImageOptions: {
//         image: ContainerImage.fromEcrRepository(
//           Repository.fromRepositoryName(this, "ImageRepository", "image_repository"),
//           "latest"
//         )
//       }
//     })
//     service.targetGroup.configureHealthCheck({ path: "/health" })
  }
}

