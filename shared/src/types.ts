export type ScoringType = 'made_missed' | 'stroke_count' | 'custom';

export interface DrillType {
  id: string;
  name: string;
  description: string;
  scoring_type: ScoringType;
  categories: string[];
  metadata?: Record<string, any>;
  created_at: number;
  updated_at: number;
  is_default: boolean;
  deleted_at?: number;
}

export interface Session {
  id: string;
  drill_type_id: string;
  started_at: number;
  completed_at?: number;
  notes?: string;
  created_at: number;
  updated_at: number;
  sync_version: number;
  device_id: string;
  deleted_at?: number;
}

export interface Result {
  id: string;
  session_id: string;
  category: string;
  outcome: string;
  ball_number?: number;
  sequence: number;
  recorded_at: number;
  created_at: number;
  updated_at: number;
  sync_version: number;
  device_id: string;
  deleted_at?: number;
}

export interface SyncState {
  device_id: string;
  last_sync_at: number;
  last_pull_version: number;
}

export interface SyncRequest {
  deviceId: string;
  lastSyncAt: number;
  changes: {
    drills: DrillType[];
    sessions: Session[];
    results: Result[];
    deleted: {
      drills: string[];
      sessions: string[];
      results: string[];
    };
  };
}

export interface SyncResponse {
  serverTime: number;
  changes: {
    drills: DrillType[];
    sessions: Session[];
    results: Result[];
    deleted: {
      drills: string[];
      sessions: string[];
      results: string[];
    };
  };
  conflicts: Array<{
    type: 'drill' | 'session' | 'result';
    id: string;
    clientVersion: any;
    serverVersion: any;
  }>;
}

export interface DrillStats {
  drill_id: string;
  total_sessions: number;
  total_attempts?: number;
  total_made?: number;
  success_rate?: number;
  average_strokes?: number;
  by_category?: Record<string, {
    attempts: number;
    made?: number;
    success_rate?: number;
    average_strokes?: number;
  }>;
}

export interface ProgressionData {
  session_id: string;
  started_at: number;
  total_attempts?: number;
  total_made?: number;
  success_rate?: number;
  average_strokes?: number;
  total_strokes?: number;
}
