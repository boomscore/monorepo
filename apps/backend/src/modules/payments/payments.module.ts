/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

// Entities
import { Subscription } from './entities/subscription.entity';
import { Payment } from './entities/payment.entity';
import { User } from '@/modules/users/entities/user.entity';

// Services
import { PaymentsService } from './services/payments.service';
import { SubscriptionService } from './services/subscription.service';
import { PaystackService } from './services/paystack.service';
import { WebhookService } from './services/webhook.service';

// Resolvers
import { PaymentsResolver } from './resolvers/payments.resolver';
import { SubscriptionResolver } from './resolvers/subscription.resolver';

// Controllers
import { WebhookController } from './controllers/webhook.controller';

// Other modules
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, Payment, User]),
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    UsersModule,
  ],
  controllers: [WebhookController],
  providers: [
    // Services
    PaymentsService,
    SubscriptionService,
    PaystackService,
    WebhookService,

    // Resolvers
    PaymentsResolver,
    SubscriptionResolver,
  ],
  exports: [PaymentsService, SubscriptionService, PaystackService],
})
export class PaymentsModule {}
