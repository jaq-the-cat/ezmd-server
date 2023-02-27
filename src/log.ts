export enum ErrorType {
  Server,
  Client,
  Unknown,
};

export function log(message: any, errorType?: ErrorType) {
  const date = new Date();
  process.stdout.write(`${date.toUTCString().substring(5).replace(" GMT", "")}.${date.getUTCMilliseconds()}: `);
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
