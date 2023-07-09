import * as cdk from 'aws-cdk-lib';
import { Peer, Port, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Cluster, ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { Protocol } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
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

    // sample service using available test image from aws - this deploys ok
    //new ApplicationLoadBalancedFargateService(this, "TestFargateService1", {
    //  cluster,
    //  cpu: 256,
    //  desiredCount: 1,
    //  memoryLimitMiB: 512,
    //  taskImageOptions: { image: ContainerImage.fromRegistry("amazon/amazon-ecs-sample") }
    //})
    
    const securityGroup = new SecurityGroup(this, "ServiceSG", {
      securityGroupName: "test-fargate-sg",
      vpc,
      allowAllOutbound: true
    })
    securityGroup.addEgressRule(Peer.anyIpv4(), Port.tcp(80))

    const service = new ApplicationLoadBalancedFargateService(this, "TestRustFargateService", {
      cluster,
      loadBalancerName: "fargate-fun-rust-alb",
      cpu: 256,
      securityGroups: [securityGroup],
      desiredCount: 1,
      memoryLimitMiB: 512,
      taskImageOptions: {
        image: ContainerImage.fromEcrRepository(
          Repository.fromRepositoryName(this, "ImageRepository", "image_repository"),
          "latest"
        ),
        containerPort: 80
      }
    })
    //service.loadBalancer.addListener("8080", {
    //  port: 8080,
    //  defaultTargetGroups: [service.targetGroup]
    //})
    // Default is HTTP and port 80
    service.targetGroup.configureHealthCheck({ 
      path: "/health",
      port: "80"
    })
  }
}

