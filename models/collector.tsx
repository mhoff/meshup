export interface Member {
    name: string,
    id: string,
}

export type ServerOpen = Member[]

export interface ClientWeightUpdate {
    targetId: string,
    weight: number,
}

export type ClientData = {
    token: string,
    payload: ClientWeightUpdate[],
    done: boolean,
}

export interface WeightUpdate extends ClientWeightUpdate {
    sourceId: string,
}
