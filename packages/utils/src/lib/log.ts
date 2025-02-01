export const WHITE = '\x1b[37m%s\x1b[0m';
export const BLUE = '\x1b[34m%s\x1b[0m';
export const GREEN = '\x1b[32m%s\x1b[0m';
export const RED = '\x1b[31m%s\x1b[0m';
export const YELLOW = '\x1b[33m%s\x1b[0m';
export const ORANGE = '\x1b[38;5;208m%s\x1b[0m';

export const RESET = '\x1b[0m';

type LogLevel = Extract<keyof typeof console, 'log' | 'info' | 'warn' | 'error'>;

const levels: LogLevel[] = ['log', 'info', 'warn', 'error'];

const colorMap: Record<LogLevel, string> = {
  log: WHITE,
  info: BLUE,
  warn: YELLOW,
  error: ORANGE
};

function logger({
  level
}: { level: LogLevel }) {
  return (...messages: string[]) => {

    const formattedMessages = Array.isArray(messages)
      ? messages.map(m => typeof m === 'object' ? JSON.stringify(m, null, 2) : m).join('\r\n')
      : typeof messages === 'object'
        ? JSON.stringify(messages, null, 2)
        : String(messages);

    // eslint-disable-next-line no-console
    console.log(colorMap[level], formattedMessages, RESET);
  };
}

export const log: Record<LogLevel, (...messages: any[]) => void> = levels.reduce(
  (acc, level) => {
    acc[level] = logger({
      level
    });
    return acc;
  },
	{} as Record<LogLevel, (...messages: any[]) => void>
);
