import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PredictionsService, PredictionFilters } from '../services/predictions.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { User } from '@/modules/users/entities/user.entity';
import { Prediction } from '../entities/prediction.entity';
import { GeneratePredictionInput, PredictionAnalytics } from '../dto/prediction.dto';

@Resolver(() => Prediction)
@UseGuards(JwtAuthGuard)
export class PredictionsResolver {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Mutation(() => [Prediction])
  async generatePredictions(
    @Args('input') input: GeneratePredictionInput,
    @CurrentUser() user: User,
  ): Promise<Prediction[]> {
    return this.predictionsService.generatePrediction(user, input);
  }

  @Query(() => [Prediction])
  async predictions(
    @Args('matchId', { nullable: true }) matchId?: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('type', { nullable: true }) type?: string,
    @Context() context?: any,
  ): Promise<Prediction[]> {
    const user = context?.req?.user;

    const filters: PredictionFilters = {};
    if (matchId) filters.matchId = matchId;
    if (status) filters.status = status as any;
    if (type) filters.type = type as any;
    if (user) filters.userId = user.id;

    return this.predictionsService.findPredictions(filters);
  }

  @Query(() => Prediction, { nullable: true })
  async prediction(@Args('id') id: string): Promise<Prediction> {
    return this.predictionsService.findById(id);
  }

  @Query(() => PredictionAnalytics)
  async predictionAnalytics(
    @Args('dateFrom', { nullable: true }) dateFrom?: Date,
    @Args('dateTo', { nullable: true }) dateTo?: Date,
    @Context() context?: any,
  ): Promise<PredictionAnalytics> {
    const user = context?.req?.user;

    const filters: PredictionFilters = {};
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (user) filters.userId = user.id;

    return this.predictionsService.getPredictionAnalytics(filters);
  }

  @Query(() => [Prediction])
  async pastPredictions(
    @Args('limit', { defaultValue: 50 }) limit: number,
    @Context() context: any,
  ): Promise<Prediction[]> {
    const user = context.req.user;

    return this.predictionsService.findPredictions({
      userId: user.id,
      status: 'COMPLETED' as any,
    });
  }
}
