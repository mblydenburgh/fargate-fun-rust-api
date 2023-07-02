import * as cdk from 'aws-cdk-lib';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Cluster, ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { Construct } from 'constructs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cluster = Cluster.fromClusterArn(this, "ClusterRef", "arn:aws:ecs:us-east-1:415023725722:cluster/test_cluster")

    new ApplicationLoadBalancedFargateService(this, "TestFargateService", {
      cluster,
      cpu: 256,
      desiredCount: 2,
      memoryLimitMiB: 512,
      taskImageOptions: {
        image: ContainerImage.fromEcrRepository(
          Repository.fromRepositoryArn(this, "ImageRepository", "image_repository"),
          "latest"
        )
      }
    })
  }
}
