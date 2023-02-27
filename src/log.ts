export enum ErrorType {
  Server,
  Client,
  Unknown,
};

export function log(message: any, errorType?: ErrorType) {
  if (errorType !== undefined) {
    errorLog(message, errorType);
  } else {
    debugLog(message);
  }
}

export function debugLog(message: any) {
  console.log(`[DEBUG]: ${message}`);
}

export function errorLog(message: any, errorType: ErrorType) {
  console.log(`[ERROR<${ErrorType[errorType]}>]: ${message}`);
}
