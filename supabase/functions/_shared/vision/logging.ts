/**
 * Vision Logging Utility
 *
 * Structured logging for vision operations.
 * Logs all relevant metadata WITHOUT raw base64 data.
 */

import { VisionImage, VisionProvider, DetailPolicy } from './types.ts';

export interface VisionLogEntry {
  timestamp: string;
  operation: 'interpret' | 'analyze' | 'validate' | 'error';

  // Request details (no base64)
  request: {
    image_count: number;
    mime_types: string[];
    total_bytes: number;
    filenames: string[];
    detail_mode: DetailPolicy;
    has_question_context: boolean;
  };

  // Response details
  response?: {
    provider: VisionProvider;
    model: string;
    processing_time_ms: number;
    json_produced: boolean;
    raw_text_length: number;
  };

  // Trait analyzer integration
  trait_analyzer?: {
    received_image_readout: boolean;
    image_count_passed: number;
  };

  // Error details
  error?: {
    message: string;
    provider?: VisionProvider;
    is_retryable: boolean;
  };

  // Context
  context?: {
    persona_id?: string;
    session_id?: string;
    question_index?: number;
    project_id?: string;
  };
}

/**
 * Create a log entry for vision operations
 */
export function createVisionLogEntry(
  operation: VisionLogEntry['operation'],
  images: VisionImage[],
  detailMode: DetailPolicy,
  hasQuestionContext: boolean,
  context?: VisionLogEntry['context']
): VisionLogEntry {
  return {
    timestamp: new Date().toISOString(),
    operation,
    request: {
      image_count: images.length,
      mime_types: images.map(i => i.mime_type),
      total_bytes: images.reduce((sum, i) => sum + (i.size_bytes || 0), 0),
      filenames: images.map(i => i.filename || 'unnamed').filter(Boolean),
      detail_mode: detailMode,
      has_question_context: hasQuestionContext,
    },
    context,
  };
}

/**
 * Add response details to a log entry
 */
export function addResponseToLog(
  entry: VisionLogEntry,
  provider: VisionProvider,
  model: string,
  processingTimeMs: number,
  jsonProduced: boolean,
  rawTextLength: number
): VisionLogEntry {
  return {
    ...entry,
    response: {
      provider,
      model,
      processing_time_ms: processingTimeMs,
      json_produced: jsonProduced,
      raw_text_length: rawTextLength,
    },
  };
}

/**
 * Add trait analyzer details to a log entry
 */
export function addTraitAnalyzerToLog(
  entry: VisionLogEntry,
  receivedImageReadout: boolean,
  imageCountPassed: number
): VisionLogEntry {
  return {
    ...entry,
    trait_analyzer: {
      received_image_readout: receivedImageReadout,
      image_count_passed: imageCountPassed,
    },
  };
}

/**
 * Add error details to a log entry
 */
export function addErrorToLog(
  entry: VisionLogEntry,
  message: string,
  provider?: VisionProvider,
  isRetryable: boolean = false
): VisionLogEntry {
  return {
    ...entry,
    operation: 'error',
    error: {
      message,
      provider,
      is_retryable: isRetryable,
    },
  };
}

/**
 * Log a vision operation to console in structured format
 */
export function logVisionOperation(entry: VisionLogEntry): void {
  // Format for easy parsing in log aggregators
  const logLine = {
    level: entry.error ? 'error' : 'info',
    type: 'vision_operation',
    ...entry,
  };

  if (entry.error) {
    console.error(JSON.stringify(logLine));
  } else {
    console.log(JSON.stringify(logLine));
  }
}

/**
 * Create a summary string for quick logging
 */
export function summarizeVisionOperation(entry: VisionLogEntry): string {
  const parts: string[] = [
    `[Vision:${entry.operation}]`,
    `${entry.request.image_count} img(s)`,
    `[${entry.request.mime_types.join(',')}]`,
    `detail:${entry.request.detail_mode}`,
  ];

  if (entry.response) {
    parts.push(
      `-> ${entry.response.provider}/${entry.response.model}`,
      `${entry.response.processing_time_ms}ms`,
      entry.response.json_produced ? 'JSON:yes' : 'JSON:no'
    );
  }

  if (entry.trait_analyzer) {
    parts.push(
      `trait_analyzer:${entry.trait_analyzer.received_image_readout ? 'received' : 'not_received'}`
    );
  }

  if (entry.error) {
    parts.push(`ERROR: ${entry.error.message}`);
  }

  return parts.join(' | ');
}

/**
 * Vision operation logger class for easier chaining
 */
export class VisionLogger {
  private entry: VisionLogEntry;

  constructor(
    operation: VisionLogEntry['operation'],
    images: VisionImage[],
    detailMode: DetailPolicy,
    hasQuestionContext: boolean,
    context?: VisionLogEntry['context']
  ) {
    this.entry = createVisionLogEntry(operation, images, detailMode, hasQuestionContext, context);
  }

  withResponse(
    provider: VisionProvider,
    model: string,
    processingTimeMs: number,
    jsonProduced: boolean,
    rawTextLength: number
  ): this {
    this.entry = addResponseToLog(this.entry, provider, model, processingTimeMs, jsonProduced, rawTextLength);
    return this;
  }

  withTraitAnalyzer(receivedImageReadout: boolean, imageCountPassed: number): this {
    this.entry = addTraitAnalyzerToLog(this.entry, receivedImageReadout, imageCountPassed);
    return this;
  }

  withError(message: string, provider?: VisionProvider, isRetryable?: boolean): this {
    this.entry = addErrorToLog(this.entry, message, provider, isRetryable);
    return this;
  }

  withContext(context: VisionLogEntry['context']): this {
    this.entry.context = { ...this.entry.context, ...context };
    return this;
  }

  log(): void {
    logVisionOperation(this.entry);
  }

  logSummary(): void {
    console.log(summarizeVisionOperation(this.entry));
  }

  getEntry(): VisionLogEntry {
    return this.entry;
  }
}
