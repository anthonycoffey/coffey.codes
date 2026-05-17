/**
 * GA4 (Google Analytics Data API) engine.
 *
 * Pulls seven parallel reports:
 *   - trafficSources (channel/source/medium)
 *   - organicLandingPages (organic-search filtered, with engagement metrics)
 *   - userBehavior by device
 *   - userBehavior by country
 *   - engagement totals
 *   - trafficSources excluding bot regions
 *   - userBehavior by country excluding bot regions
 *
 * The bot-region exclusion is per SPEC-018; the list of bot regions comes
 * in via config (default: ['China', 'Singapore']).
 */

import { BetaAnalyticsDataClient, protos } from '@google-analytics/data';

import type {
  Ga4EngineData,
  Ga4Section,
  SnapshotWindow,
} from '../types/snapshot.js';
import type { GoogleServiceAccountCredentials } from '../lib/auth.js';

type RunReportRequest = protos.google.analytics.data.v1beta.IRunReportRequest;
type RunReportResponse = protos.google.analytics.data.v1beta.IRunReportResponse;
type IDimensionFilter = protos.google.analytics.data.v1beta.IFilterExpression;

export interface PullGa4Options {
  propertyId: string;
  startDate: string;
  endDate: string;
  windowDays: number;
  credentials: GoogleServiceAccountCredentials;
  botRegions: string[];
}

/**
 * Spec for a single GA4 report. We compose these into requests and then
 * possibly re-issue them with an added bot-region filter for the
 * "*ExBotRegions" slices.
 */
type ReportSpec = Omit<RunReportRequest, 'property' | 'dateRanges'>;

function normalizeSection(resp: RunReportResponse): Ga4Section {
  return {
    dimensionHeaders: (resp.dimensionHeaders ?? []).map((h) => ({
      name: h.name ?? '',
    })),
    metricHeaders: (resp.metricHeaders ?? []).map((h) => ({
      name: h.name ?? '',
      type: h.type ? String(h.type) : undefined,
    })),
    rows: (resp.rows ?? []).map((row) => ({
      dimensionValues: (row.dimensionValues ?? []).map((v) => ({
        value: v.value ?? undefined,
      })),
      metricValues: (row.metricValues ?? []).map((v) => ({
        value: v.value ?? undefined,
      })),
    })),
  };
}

export async function pullGa4({
  propertyId,
  startDate,
  endDate,
  windowDays,
  credentials,
  botRegions,
}: PullGa4Options): Promise<Ga4EngineData> {
  if (!propertyId) {
    throw new Error('GA4_PROPERTY_ID is required for GA4 puller');
  }
  const property = `properties/${propertyId}`;

  const ga4 = new BetaAnalyticsDataClient({ credentials });

  const excludeBotRegions: IDimensionFilter = {
    notExpression: {
      filter: {
        fieldName: 'country',
        inListFilter: { values: botRegions },
      },
    },
  };

  const runReport = async (spec: ReportSpec): Promise<Ga4Section> => {
    const [resp] = await ga4.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      ...spec,
    });
    return normalizeSection(resp);
  };

  const trafficSourcesSpec: ReportSpec = {
    dimensions: [
      { name: 'sessionDefaultChannelGroup' },
      { name: 'sessionSource' },
      { name: 'sessionMedium' },
    ],
    metrics: [{ name: 'sessions' }, { name: 'conversions' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 15,
  };

  const organicLandingPagesSpec: ReportSpec = {
    dimensions: [{ name: 'landingPagePlusQueryString' }],
    metrics: [
      { name: 'sessions' },
      { name: 'bounceRate' },
      { name: 'conversions' },
      { name: 'engagementRate' },
      { name: 'averageSessionDuration' },
    ],
    dimensionFilter: {
      filter: {
        fieldName: 'sessionDefaultChannelGroup',
        stringFilter: { matchType: 'EXACT', value: 'Organic Search' },
      },
    },
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 15,
  };

  const userBehaviorByDeviceSpec: ReportSpec = {
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'engagementRate' },
    ],
  };

  const userBehaviorByCountrySpec: ReportSpec = {
    dimensions: [{ name: 'country' }],
    metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
    limit: 10,
  };

  const engagementSpec: ReportSpec = {
    metrics: [
      { name: 'averageSessionDuration' },
      { name: 'engagementRate' },
    ],
  };

  /**
   * Compose a bot-region-excluded variant of a spec by anding the
   * existing dimension filter (if any) with the exclude filter. The
   * structure mirrors what the .mjs script produced for SPEC-018 parity.
   */
  const withBotFilter = (spec: ReportSpec): ReportSpec => {
    if (spec.dimensionFilter) {
      return {
        ...spec,
        dimensionFilter: {
          andGroup: {
            expressions: [spec.dimensionFilter, excludeBotRegions],
          },
        },
      };
    }
    return { ...spec, dimensionFilter: excludeBotRegions };
  };

  const [
    trafficSources,
    organicLandingPages,
    userBehaviorByDevice,
    userBehaviorByCountry,
    engagement,
    trafficSourcesExBotRegions,
    userBehaviorByCountryExBotRegions,
  ] = await Promise.all([
    runReport(trafficSourcesSpec),
    runReport(organicLandingPagesSpec),
    runReport(userBehaviorByDeviceSpec),
    runReport(userBehaviorByCountrySpec),
    runReport(engagementSpec),
    runReport(withBotFilter(trafficSourcesSpec)),
    runReport(withBotFilter(userBehaviorByCountrySpec)),
  ]);

  const window: SnapshotWindow = { startDate, endDate, days: windowDays };

  return {
    window,
    propertyId,
    botRegionsExcluded: botRegions,
    trafficSources,
    organicLandingPages,
    userBehavior: {
      devices: userBehaviorByDevice,
      countries: userBehaviorByCountry,
      engagement,
    },
    trafficSourcesExBotRegions,
    userBehaviorExBotRegions: {
      countries: userBehaviorByCountryExBotRegions,
    },
  };
}
