/**
 * Log levels for the application
 */
export enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARNING = "WARNING",
    ERROR = "ERROR",
}

/**
 * Emoji mappings for different log levels
 */
const LEVEL_EMOJIS = {
    [LogLevel.DEBUG]: "🔍",
    [LogLevel.INFO]: "ℹ️",
    [LogLevel.WARNING]: "⚠️",
    [LogLevel.ERROR]: "❌",
}

/**
 * Color codes for different log levels (for console)
 */
const LEVEL_COLORS = {
    [LogLevel.DEBUG]: "\x1b[36m", // Cyan
    [LogLevel.INFO]: "\x1b[32m", // Green
    [LogLevel.WARNING]: "\x1b[33m", // Yellow
    [LogLevel.ERROR]: "\x1b[31m", // Red
}

/**
 * Reset color code
 */
const RESET_COLOR = "\x1b[0m"

/**
 * Global flag to enable/disable logging
 * Should be set to true only in development/debug environments
 */
let isDebugEnabled = __DEV__

/**
 * Sets whether debug logging is enabled
 */
export const setDebugEnabled = (enabled: boolean): void => {
    isDebugEnabled = enabled
}

/**
 * Gets whether debug logging is enabled
 */
export const isDebugMode = (): boolean => {
    return isDebugEnabled
}

/**
 * Formats the current timestamp for logging
 */
const getTimestamp = (): string => {
    const now = new Date()
    return now.toISOString().replace("T", " ").substring(0, 23)
}

/**
 * Core logging function
 */
const logMessage = (
    level: LogLevel,
    module: string,
    message: string,
    data?: any
): void => {
    if (!isDebugEnabled) return

    const emoji = LEVEL_EMOJIS[level]
    const color = LEVEL_COLORS[level]
    const timestamp = getTimestamp()

    // Format: [TIMESTAMP] EMOJI [LEVEL] [MODULE] Message
    const formattedHeader = `[${timestamp}] ${emoji} ${color}[${level}]${RESET_COLOR} [${module}]`

    // Log the message
    console.log(`${formattedHeader} ${message}`)

    // If additional data is provided, log it on the next line
    if (data !== undefined) {
        try {
            if (typeof data === "object") {
                console.log(
                    `${" ".repeat(timestamp.length + 3)}↳ `,
                    JSON.stringify(data, null, 2)
                )
            } else {
                console.log(`${" ".repeat(timestamp.length + 3)}↳ `, data)
            }
        } catch (e) {
            console.log(
                `${" ".repeat(timestamp.length + 3)}↳ [Unserializable Data]`
            )
        }
    }
}

/**
 * Logger class
 */
export class Logger {
    private module: string

    /**
     * Create a logger for a specific module
     * @param module The module name for this logger instance
     */
    constructor(module: string) {
        this.module = module
    }

    /**
     * Log a debug message
     */
    debug(message: string, data?: any): void {
        logMessage(LogLevel.DEBUG, this.module, message, data)
    }

    /**
     * Log an info message
     */
    info(message: string, data?: any): void {
        logMessage(LogLevel.INFO, this.module, message, data)
    }

    /**
     * Log a warning message
     */
    warn(message: string, data?: any): void {
        logMessage(LogLevel.WARNING, this.module, message, data)
    }

    /**
     * Log an error message
     */
    error(message: string, data?: any): void {
        logMessage(LogLevel.ERROR, this.module, message, data)
    }
}

/**
 * Create a logger for a specific module
 * @param module The module name
 */
export const createLogger = (module: string): Logger => {
    return new Logger(module)
}

// Export a default logger for quick use
export default {
    createLogger,
    setDebugEnabled,
    isDebugMode,
}
