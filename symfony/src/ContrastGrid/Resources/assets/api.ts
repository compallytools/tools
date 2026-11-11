import { apiFetch } from '@common/api/client';
import { path } from '@router';

export interface PingResponse {
    module: string;
    status: string;
}

export function ping(): Promise<PingResponse> {
    return apiFetch<PingResponse>(path('contrast_grid_api_ping'));
}
