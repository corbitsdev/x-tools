/** Non-2xx response from the X API — carries status and raw body text. */
export class XAPIError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(status: number, statusText: string, body: string) {
    super(`X API request failed: ${String(status)} ${statusText}`);
    this.name = "XAPIError";
    this.status = status;
    this.body = body;
  }
}
