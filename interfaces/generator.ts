export interface PartitioningRequest {
    connectedness: number[][],
    groupSize: number,
    alternateGroupSizes: number[],
}

export interface PartitioningResponse {
    partitions: number[];
}
