/**
 * Base Abstract Verification Adapter
 * Defines the contract for all external government registry verifications (GSTN, Udyam, Debarment).
 */

export interface AdapterResponse<T> {
  success: boolean;
  adapter_name: string;
  source_endpoint: string;
  execution_ms: number;
  timestamp: string;
  data?: T;
  error?: string;
}

export abstract class VerificationAdapter<TInput, TOutput> {
  abstract readonly adapterName: string;
  abstract readonly sourceEndpoint: string;

  /**
   * Simulate realistic government API network round-trip latency (200ms - 400ms)
   */
  protected async simulateLatency(minMs = 200, maxMs = 400): Promise<number> {
    const latency = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    await new Promise((resolve) => setTimeout(resolve, latency));
    return latency;
  }

  /**
   * Main verification execution method with latency simulation and error handling
   */
  async verify(input: TInput): Promise<AdapterResponse<TOutput>> {
    const startTime = Date.now();
    try {
      const latency = await this.simulateLatency();
      const data = await this.executeVerification(input);
      const totalMs = Date.now() - startTime;

      return {
        success: true,
        adapter_name: this.adapterName,
        source_endpoint: this.sourceEndpoint,
        execution_ms: totalMs,
        timestamp: new Date().toISOString(),
        data,
      };
    } catch (err: unknown) {
      const totalMs = Date.now() - startTime;
      const message = err instanceof Error ? err.message : 'Unknown registry adapter failure';
      return {
        success: false,
        adapter_name: this.adapterName,
        source_endpoint: this.sourceEndpoint,
        execution_ms: totalMs,
        timestamp: new Date().toISOString(),
        error: message,
      };
    }
  }

  /**
   * Implementation-specific verification logic to be overridden by subclasses
   */
  protected abstract executeVerification(input: TInput): Promise<TOutput>;
}
