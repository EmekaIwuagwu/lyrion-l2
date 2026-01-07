export const RPC_URL = "http://localhost:8545";

export interface RPCResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
  };
}

export async function rpcCall<T>(method: string, params: any[] = []): Promise<T> {
  const body = JSON.stringify({
    jsonrpc: "2.0",
    method,
    params,
    id: 1, // simplified ID
  });

  try {
    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });

    const json: RPCResponse<T> = await res.json();
    if (json.error) {
      throw new Error(json.error.message);
    }
    return json.result as T;
  } catch (error) {
    console.error(`RPC Error [${method}]:`, error);
    throw error;
  }
}
