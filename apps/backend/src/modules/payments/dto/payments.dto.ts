/*
 * BoomScore AI
 * Copyright (c) 2024
 * All rights reserved.
 */

import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsString } from 'class-validator';
import { SubscriptionPlan, BillingCycle } from '../entities/subscription.entity';
import { Payment } from '../entities/payment.entity';

@InputType()
export class InitiatePaymentInput {
  @Field(() => SubscriptionPlan)
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @Field(() => BillingCycle)
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;
}

@ObjectType()
export class PaymentResponse {
  @Field(() => Payment)
  payment: Payment;

  @Field()
  paymentUrl: string;

  @Field()
  reference: string;
}

@InputType()
export class CreateSubscriptionInput {
  @Field(() => SubscriptionPlan)
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @Field(() => BillingCycle)
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;
}
