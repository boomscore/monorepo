import { Controller, Post, Get } from '@nestjs/common';
import { SportsService } from '../services/sports.service';
import { SportsIngestionService } from '../services/sports-ingestion.service';
import { LoggerService } from '@/common/services/logger.service';

@Controller('api/sports/sync')
export class SportsSyncController {
  constructor(
    private readonly sportsService: SportsService,
    private readonly sportsIngestionService: SportsIngestionService,
    private readonly logger: LoggerService,
  ) {}

  @Post('initialize')
  async initializeSports() {
    try {
      this.logger.info('Manual sports initialization triggered', {
        service: 'sports-sync-controller',
      });

      await this.sportsService.syncLeagues();

      return {
        success: true,
        message: 'Sports initialization completed successfully',
      };
    } catch (error) {
      this.logger.error('Sports initialization failed', error.stack, {
        service: 'sports-sync-controller',
      });

      return {
        success: false,
        message: 'Sports initialization failed',
        error: error.message,
      };
    }
  }

  @Post('sync')
  async triggerFullSync() {
    try {
      this.logger.info('Manual full sync triggered', {
        service: 'sports-sync-controller',
      });

      await this.sportsService.syncLeagues();

      return {
        success: true,
        message: 'Full sync completed successfully',
      };
    } catch (error) {
      this.logger.error('Full sync failed', error.stack, {
        service: 'sports-sync-controller',
      });

      return {
        success: false,
        message: 'Full sync failed',
        error: error.message,
      };
    }
  }

  @Get('status')
  async getSyncStatus() {
    return {
      success: true,
      message: 'Sync status retrieved',
      data: {
        lastSync: new Date(),
        status: 'active',
      },
    };
  }

  @Post('live')
  async syncLiveMatches() {
    try {
      this.logger.info('Manual live matches sync triggered', {
        service: 'sports-sync-controller',
      });

      await this.sportsIngestionService.updateLiveMatches();

      return {
        success: true,
        message: 'Live matches sync completed successfully',
      };
    } catch (error) {
      this.logger.error('Live matches sync failed', error.stack, {
        service: 'sports-sync-controller',
      });

      return {
        success: false,
        message: 'Live matches sync failed',
        error: error.message,
      };
    }
  }
}
