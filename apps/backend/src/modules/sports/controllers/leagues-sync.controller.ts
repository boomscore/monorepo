import { Controller, Post, Get } from '@nestjs/common';
import { SportsService } from '../services/sports.service';
import { LoggerService } from '@/common/services/logger.service';

@Controller('api/leagues/sync')
export class LeaguesSyncController {
  constructor(
    private readonly sportsService: SportsService,
    private readonly logger: LoggerService,
  ) {}

  @Post('all')
  async syncAllLeagues() {
    try {
      this.logger.info('Manual league sync triggered', {
        service: 'leagues-sync-controller',
      });

      await this.sportsService.syncLeagues();

      return {
        success: true,
        message: 'All leagues synced successfully',
      };
    } catch (error) {
      this.logger.error('League sync failed', error.stack, {
        service: 'leagues-sync-controller',
      });

      return {
        success: false,
        message: 'League sync failed',
        error: error.message,
      };
    }
  }

  @Get('status')
  async getSyncStatus() {
    try {
      const leagues = await this.sportsService.getAllLeagues();
      return {
        success: true,
        message: 'Sync status retrieved',
        data: {
          totalLeagues: leagues.length,
          lastSync: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get sync status',
        error: error.message,
      };
    }
  }
}
