/*
 *
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { Payment } from '../entities/payment.entity';
import { InitiatePaymentInput, PaymentResponse } from '../dto/payments.dto';

@Resolver(() => Payment)
@UseGuards(JwtAuthGuard)
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Mutation(() => PaymentResponse)
  async initiatePayment(
    @Args('input', { type: () => InitiatePaymentInput }) input: InitiatePaymentInput,
    @Context() context: any,
  ): Promise<PaymentResponse> {
    const user = context.req.user;
    return this.paymentsService.initiatePayment(user, input);
  }

  @Mutation(() => Payment)
  async verifyPayment(@Args('reference') reference: string): Promise<Payment> {
    return this.paymentsService.verifyPayment(reference);
  }

  @Query(() => [Payment])
  async myPayments(@Context() context: any): Promise<Payment[]> {
    const user = context.req.user;
    return this.paymentsService.getUserPayments(user.id);
  }

  @Query(() => Payment, { nullable: true })
  async payment(@Args('id') id: string): Promise<Payment> {
    return this.paymentsService.getPaymentById(id);
  }
}
