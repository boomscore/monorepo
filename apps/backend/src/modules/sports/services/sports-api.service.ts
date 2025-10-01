/*
 * Sports Prediction Platform
 * Copyright (c) 2024
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@/common/services/logger.service';
import { MetricsService } from '@/metrics/metrics.service';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiFootballResponse<T = any> {
  get: string;
  parameters: Record<string, any>;
  errors: any[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T[];
}

interface RateLimitInfo {
  requests: number;
  remaining: number;
  reset: number;
}

@Injectable()
export class SportsApiService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private rateLimitInfo: RateLimitInfo | null = null;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly metricsService: MetricsService,
  ) {
    this.baseUrl = this.configService.get<string>('SPORT_API_BASE_URL');
    this.apiKey = this.configService.get<string>('SPORT_API_KEY');
  }

  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, any> = {},
    retries = 3,
  ): Promise<ApiFootballResponse<T>> {
    return new Promise((resolve, reject) => {
      const requestFn = async () => {
        const startTime = Date.now();

        try {
          // Check rate limits before making request
          if (this.rateLimitInfo && this.rateLimitInfo.remaining <= 1) {
            const waitTime = this.rateLimitInfo.reset * 1000 - Date.now();
            if (waitTime > 0) {
              this.logger.info(`Rate limit reached, waiting ${waitTime}ms`, {
                service: 'sports-api',
                waitTime,
              });
              await this.sleep(waitTime);
            }
          }

          const config: AxiosRequestConfig = {
            url: `${this.baseUrl}/${endpoint}`,
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': this.apiKey,
              'X-RapidAPI-Host': 'v3.football.api-sports.io',
            },
            params,
            timeout: 30000,
          };

          const response: AxiosResponse<ApiFootballResponse<T>> = await firstValueFrom(
            this.httpService.request(config),
          );

          // Update rate limit info from headers
          this.updateRateLimitInfo(response.headers);

          // Log successful request
          const duration = Date.now() - startTime;
          this.logger.info('Sports API request successful', {
            service: 'sports-api',
            endpoint,
            params,
            duration: `${duration}ms`,
            results: response.data.results,
            remaining: this.rateLimitInfo?.remaining,
          });

          // Record metrics
          this.metricsService.recordDatabaseQueryDuration('sports-api-request', duration);

          return response.data;
        } catch (error) {
          const duration = Date.now() - startTime;

          this.logger.error('Sports API request failed', error.stack, {
            service: 'sports-api',
            endpoint,
            params,
            duration: `${duration}ms`,
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
          });

          // Handle rate limiting
          if (error.response?.status === 429) {
            const retryAfter = parseInt(error.response.headers['retry-after'] || '60', 10);
            await this.sleep(retryAfter * 1000);

            if (retries > 0) {
              return await this.makeRequest(endpoint, params, retries - 1);
            }
          }

          // Handle server errors with exponential backoff
          if (error.response?.status >= 500 && retries > 0) {
            const backoffTime = Math.pow(2, 4 - retries) * 1000; // 2s, 4s, 8s
            await this.sleep(backoffTime);
            return await this.makeRequest(endpoint, params, retries - 1);
          }

          throw error;
        }
      };

      this.requestQueue.push(requestFn);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const requestFn = this.requestQueue.shift()!;

      try {
        const result = await requestFn();
        return result;
      } catch (error) {
        throw error;
      } finally {
        // Add a small delay between requests to respect rate limits
        await this.sleep(100);
      }
    }

    this.isProcessingQueue = false;
  }

  private updateRateLimitInfo(headers: any): void {
    const requests = parseInt(headers['x-ratelimit-requests-remaining'], 10);
    const remaining = parseInt(headers['x-ratelimit-requests-remaining'], 10);
    const reset = parseInt(headers['x-ratelimit-requests-reset'], 10);

    if (!isNaN(requests) && !isNaN(remaining) && !isNaN(reset)) {
      this.rateLimitInfo = { requests, remaining, reset };
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API methods

  async getLeagues(
    params: {
      id?: number;
      name?: string;
      country?: string;
      code?: string;
      season?: number;
      team?: number;
      type?: string;
      current?: boolean;
      search?: string;
    } = {},
  ): Promise<any[]> {
    const response = await this.makeRequest('leagues', params);
    return response.response;
  }

  async getTeams(
    params: {
      id?: number;
      name?: string;
      league?: number;
      season?: number;
      country?: string;
      code?: string;
      venue?: number;
      search?: string;
    } = {},
  ): Promise<any[]> {
    const response = await this.makeRequest('teams', params);
    return response.response;
  }

  async getFixtures(
    params: {
      id?: number;
      ids?: string;
      live?: 'all' | string;
      date?: string;
      league?: number;
      season?: number;
      team?: number;
      last?: number;
      next?: number;
      from?: string;
      to?: string;
      round?: string;
      status?: string;
      venue?: number;
      timezone?: string;
    } = {},
  ): Promise<any[]> {
    const response = await this.makeRequest('fixtures', params);
    return response.response;
  }

  async getFixtureEvents(fixtureId: number): Promise<any[]> {
    const response = await this.makeRequest('fixtures/events', { fixture: fixtureId });
    return response.response;
  }

  async getFixtureStatistics(fixtureId: number): Promise<any[]> {
    const response = await this.makeRequest('fixtures/statistics', { fixture: fixtureId });
    return response.response;
  }

  async getStandings(params: { league: number; season: number; team?: number }): Promise<any[]> {
    const response = await this.makeRequest('standings', params);
    return response.response;
  }

  async getOdds(
    params: {
      fixture?: number;
      league?: number;
      season?: number;
      date?: string;
      timezone?: string;
      page?: number;
      bet?: number;
      bookmaker?: number;
    } = {},
  ): Promise<any[]> {
    const response = await this.makeRequest('odds', params);
    return response.response;
  }

  async getPredictions(fixtureId: number): Promise<any[]> {
    const response = await this.makeRequest('predictions', { fixture: fixtureId });
    return response.response;
  }

  async getH2H(params: {
    h2h: string; // team1-team2 format
    date?: string;
    league?: number;
    season?: number;
    last?: number;
    next?: number;
    from?: string;
    to?: string;
    status?: string;
    venue?: number;
    timezone?: string;
  }): Promise<any[]> {
    const response = await this.makeRequest('fixtures/headtohead', params);
    return response.response;
  }

  async getTeamStatistics(params: {
    league: number;
    season: number;
    team: number;
    date?: string;
  }): Promise<any[]> {
    const response = await this.makeRequest('teams/statistics', params);
    return response.response;
  }

  async getPlayersStatistics(params: {
    id?: number;
    team?: number;
    league?: number;
    season: number;
    page?: number;
  }): Promise<any[]> {
    const response = await this.makeRequest('players', params);
    return response.response;
  }

  async getVenues(
    params: {
      id?: number;
      name?: string;
      city?: string;
      country?: string;
      search?: string;
    } = {},
  ): Promise<any[]> {
    const response = await this.makeRequest('venues', params);
    return response.response;
  }

  async getCountries(): Promise<any[]> {
    const response = await this.makeRequest('countries');
    return response.response;
  }

  async getTimezones(): Promise<string[]> {
    const response = await this.makeRequest<string>('timezone');
    return response.response;
  }

  // Helper methods for common operations

  async getTodaysMatches(timezone = 'UTC'): Promise<any[]> {
    const today = new Date().toISOString().split('T')[0];
    return await this.getFixtures({
      date: today,
      timezone,
    });
  }

  async getLiveMatches(): Promise<any[]> {
    return await this.getFixtures({
      live: 'all',
    });
  }

  async getLeagueMatches(
    leagueId: number,
    season: number,
    options: {
      from?: string;
      to?: string;
      status?: string;
    } = {},
  ): Promise<any[]> {
    return await this.getFixtures({
      league: leagueId,
      season,
      ...options,
    });
  }

  async getTeamMatches(
    teamId: number,
    options: {
      league?: number;
      season?: number;
      last?: number;
      next?: number;
      from?: string;
      to?: string;
    } = {},
  ): Promise<any[]> {
    return await this.getFixtures({
      team: teamId,
      ...options,
    });
  }

  async getMatchWithDetails(fixtureId: number): Promise<{
    fixture: any;
    events: any[];
    statistics: any[];
  }> {
    const [fixtures, events, statistics] = await Promise.all([
      this.getFixtures({ id: fixtureId }),
      this.getFixtureEvents(fixtureId),
      this.getFixtureStatistics(fixtureId),
    ]);

    return {
      fixture: fixtures[0] || null,
      events,
      statistics,
    };
  }

  // Missing methods for Sports Ingestion Service
  async getFixturesByDate(date: string): Promise<any[]> {
    return await this.getFixtures({ date });
  }

  async getTeamsByLeague(leagueId: number, season: number): Promise<any[]> {
    const response = await this.makeRequest('teams', {
      league: leagueId,
      season,
    });
    return response.response;
  }

  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  getApiStatus(): {
    healthy: boolean;
    rateLimitInfo: RateLimitInfo | null;
    queueSize: number;
  } {
    return {
      healthy: this.rateLimitInfo ? this.rateLimitInfo.remaining > 0 : true,
      rateLimitInfo: this.rateLimitInfo,
      queueSize: this.requestQueue.length,
    };
  }
}
