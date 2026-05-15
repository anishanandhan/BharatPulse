/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum MatchStatus {
  PRE_MATCH = 'PRE_MATCH',
  LIVE = 'LIVE',
  HALFTIME = 'HALFTIME',
  POST_MATCH = 'POST_MATCH',
  CANCELLED = 'CANCELLED',
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string;
  score: number;
}

export enum EventType {
  GOAL = 'GOAL',
  YELLOW_CARD = 'YELLOW_CARD',
  RED_CARD = 'RED_CARD',
  SUBSTITUTION = 'SUBSTITUTION',
  MOMENT_OF_INTEREST = 'MOMENT_OF_INTEREST', // Controversy, tactical shift etc
  POLL = 'POLL',
}

export interface MatchEvent {
  id: string;
  type: EventType;
  minute: number;
  description: string;
  teamId?: string;
  playerName?: string;
  aiInsight?: string;
}

export interface FanSentiment {
  timestamp: string;
  pulseScore: number; // 0-100, 50 is neutral
  label: string;
}

export interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  isActive: boolean;
}

export interface FanMission {
  id: string;
  title: string;
  description: string;
  type: 'PREDICTION' | 'TACTICAL' | 'QUIZ';
  options: string[];
  reward?: string;
}

export interface Match {
  id: string;
  competition: string;
  status: MatchStatus;
  homeTeam: Team;
  awayTeam: Team;
  clock: string;
  timeline: MatchEvent[];
  activePoll?: Poll;
  activeMission?: FanMission;
  venue: string;
  liveStats?: { label: string; home: any; away: any }[];
}
