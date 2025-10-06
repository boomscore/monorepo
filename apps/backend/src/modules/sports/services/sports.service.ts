import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sport } from '../entities/sport.entity';
import { League } from '../entities/league.entity';
import { SportsApiService } from './sports-api.service';
import { LoggerService } from '@/common/services/logger.service';
import { SportType, SPORT_CONFIGS } from '../enums/sport-type.enum';

@Injectable()
export class SportsService {
  constructor(
    @InjectRepository(Sport)
    private readonly sportRepository: Repository<Sport>,
    @InjectRepository(League)
    private readonly leagueRepository: Repository<League>,
    private readonly sportsApiService: SportsApiService,
    private readonly logger: LoggerService,
  ) {}

  async syncLeagues(): Promise<void> {
    this.logger.info('Starting league sync', { service: 'sports' });

    try {
      this.logger.info(
        'Fetching leagues from API (trying season filter first for smaller response)',
        {
          service: 'sports',
        },
      );

      // Add a race condition with timeout to prevent indefinite hanging
      const apiPromise = this.sportsApiService.getLeagues();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('League sync timeout after 90 seconds')), 90000),
      );

      const apiLeagues = await Promise.race([apiPromise, timeoutPromise]);

      if (!apiLeagues || !Array.isArray(apiLeagues)) {
        this.logger.warn('No leagues data received from API', {
          service: 'sports',
          receivedData: typeof apiLeagues,
        });
        return;
      }

      this.logger.info(`Processing ${apiLeagues.length} leagues in batches`, { service: 'sports' });

      let created = 0;
      let updated = 0;
      let errors = 0;

      const batchSize = 50;
      const totalBatches = Math.ceil(apiLeagues.length / batchSize);

      for (let i = 0; i < apiLeagues.length; i += batchSize) {
        const batch = apiLeagues.slice(i, i + batchSize);
        const currentBatch = Math.floor(i / batchSize) + 1;

        this.logger.info(
          `Processing batch ${currentBatch}/${totalBatches} (${batch.length} leagues)`,
          {
            service: 'sports',
          },
        );

        for (const apiLeague of batch) {
          try {
            if (!apiLeague?.league?.id || !apiLeague?.league?.name) {
              errors++;
              continue;
            }

            const apiId = apiLeague.league.id.toString();
            const name = apiLeague.league.name;
            const logo = apiLeague.league.logo;
            const country = apiLeague.country?.name || 'Unknown';
            const countryCode = apiLeague.country?.code;
            const countryFlag = apiLeague.country?.flag;

            let league = await this.leagueRepository.findOne({ where: { apiId } });

            if (league) {
              league.name = name;
              league.logo = logo;
              league.country = country;
              league.countryCode = countryCode;
              league.countryFlag = countryFlag;
              league.updatedAt = new Date();
              await this.leagueRepository.save(league);
              updated++;
            } else {
              league = this.leagueRepository.create({
                apiId,
                name,
                slug: this.generateSlug(name, parseInt(apiId)),
                logo,
                country,
                countryCode,
                countryFlag,
                isActive: true,
              });
              await this.leagueRepository.save(league);
              created++;
            }
          } catch (error) {
            this.logger.error('Failed to process league', error.stack, {
              service: 'sports',
              leagueId: apiLeague?.league?.id,
            });
            errors++;
          }
        }

        if (currentBatch % 10 === 0 || currentBatch === totalBatches) {
          this.logger.info(`Progress: ${currentBatch}/${totalBatches} batches completed`, {
            service: 'sports',
            created,
            updated,
            errors,
          });
        }

        await new Promise(resolve => setTimeout(resolve, 50));
      }

      this.logger.info('League sync completed successfully', {
        service: 'sports',
        created,
        updated,
        errors,
        total: apiLeagues.length,
      });
    } catch (error) {
      this.logger.error('League sync failed', error.stack, { service: 'sports' });

      // Don't throw the error - let the app continue without leagues for now
      this.logger.warn(
        'Continuing without league sync - leagues can be synced later via API endpoint',
        {
          service: 'sports',
        },
      );
    }
  }

  private generateSlug(name: string, apiId: number): string {
    return `${name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')}-${apiId}`;
  }

  async getAllLeagues(): Promise<League[]> {
    return this.leagueRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getLeagueById(id: string): Promise<League> {
    const league = await this.leagueRepository.findOne({ where: { id } });
    if (!league) {
      throw new Error('League not found');
    }
    return league;
  }
}
