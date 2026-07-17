import type { ComponentProps } from 'react';
import type { Feather } from '@expo/vector-icons';

export type FeatherIconName = ComponentProps<typeof Feather>['name'];

export type ToolCategoryId =
  | 'image'
  | 'pdf'
  | 'archive'
  | 'qr'
  | 'storage'
  | 'browser';

export interface ToolDefinition {
  id: string;
  title: string;
  description: string;
  icon: FeatherIconName;
  category: ToolCategoryId;
  /** Route pushed when the tool card is pressed. */
  route: string;
}

/** Live status shown as a badge on a tool card while work is in flight. */
export type ToolStatus = 'idle' | 'processing' | 'done' | 'error';

/** Generic async task state used by every tool screen. */
export interface AsyncTaskState<T> {
  status: ToolStatus;
  progress: number;
  result: T | null;
  error: string | null;
}
