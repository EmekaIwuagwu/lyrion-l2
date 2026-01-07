export const RPC_URL = "http://localhost:8545"; // Default Lyrion Node Port

export async function rpcCall<T>(method: string, params: any[] = []): Promise<T> {
    const res = await fetch(RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method,
            params,
        }),
    });

    const json = await res.json();
    if (json.error) {
        throw new Error(json.error.message);
    }
    return json.result;
}
