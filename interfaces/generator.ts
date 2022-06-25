export interface MatchingRequest {
    connectedness: number[][],
    groupSize: number,
    alternateGroupSizes: number[],
}

export interface MatchingResponse {
    matches: number[][][];
}
