export interface Position { x: number; y: number; }

export interface CursorData {
  odId: string;
  avatarUrl: string;
  displayName: string;
  position: Position;
  context: 'desk' | 'book' | 'sandbox' | 'quiz';
  state: 'active' | 'idle' | 'stuck' | 'focused';
  lastUpdate: number;
}

export interface UserLocation {
  odId: string;
  view: 'desk' | 'book' | 'sandbox' | 'quiz';
  lessonId?: string;
  lastUpdate: number;
}

export type ViewContext = 'desk' | 'book' | 'sandbox' | 'quiz';
