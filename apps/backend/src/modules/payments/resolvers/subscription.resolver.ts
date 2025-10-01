/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { UseGuards } from '@nestjs/common';
import { SubscriptionService } from '../services/subscription.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { Subscription } from '../entities/subscription.entity';
import { CreateSubscriptionInput } from '../dto/payments.dto';

@Resolver(() => Subscription)
@UseGuards(JwtAuthGuard)
export class SubscriptionResolver {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Mutation(() => Subscription)
  async createSubscription(
    @Args('input', { type: () => CreateSubscriptionInput }) input: CreateSubscriptionInput,
    @Context() context: any,
  ): Promise<Subscription> {
    const user = context.req.user;
    return this.subscriptionService.createSubscription(user, input);
  }

  @Query(() => Subscription, { nullable: true })
  async myActiveSubscription(@Context() context: any): Promise<Subscription | null> {
    const user = context.req.user;
    return this.subscriptionService.getActiveSubscription(user.id);
  }

  @Query(() => [Subscription])
  async mySubscriptions(@Context() context: any): Promise<Subscription[]> {
    const user = context.req.user;
    return this.subscriptionService.getUserSubscriptions(user.id);
  }

  @Mutation(() => Subscription)
  async cancelSubscription(
    @Args('subscriptionId') subscriptionId: string,
    @Context() context: any,
  ): Promise<Subscription> {
    const user = context.req.user;
    return this.subscriptionService.cancelSubscription(subscriptionId, user.id);
  }

  @Query(() => GraphQLJSON)
  async subscriptionLimits(@Context() context: any) {
    const user = context.req.user;
    return this.subscriptionService.getSubscriptionLimits(user.id);
  }

  @Query(() => Boolean)
  async isSubscriptionActive(@Context() context: any): Promise<boolean> {
    const user = context.req.user;
    return this.subscriptionService.isSubscriptionActive(user.id);
  }
}
