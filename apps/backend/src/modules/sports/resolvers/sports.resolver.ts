import { Resolver, Query, Mutation } from '@nestjs/graphql';
import { SportsService } from '../services/sports.service';
import { LoggerService } from '@/common/services/logger.service';
import { League } from '../entities/league.entity';

@Resolver()
export class SportsResolver {
  constructor(
    private readonly sportsService: SportsService,
    private readonly logger: LoggerService,
  ) {}

  @Query(() => [League])
  async leagues(): Promise<League[]> {
    return this.sportsService.getAllLeagues();
  }

  @Query(() => League)
  async league(id: string): Promise<League> {
    return this.sportsService.getLeagueById(id);
  }

  @Mutation(() => String)
  async debugInitializeSports(): Promise<string> {
    try {
      this.logger.info('Manual initialization triggered', { service: 'sports-debug' });
      await this.sportsService.syncLeagues();
      return 'Sports initialization completed successfully';
    } catch (error) {
      this.logger.error('Manual initialization failed', error.stack, {
        service: 'sports-debug',
      });
      throw new Error(`Initialization failed: ${error.message}`);
    }
  }
}
