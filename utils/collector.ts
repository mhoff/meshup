/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-console */
// import { Peer, DataConnection } from 'peerjs';
import { ClientData, Member, ServerOpen, WeightUpdate } from '../models/collector';

export enum NetworkState {
  OFFLINE = 'OFFLINE',
  OPEN = 'OPEN',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

interface CollectorStateBase {
  networkState: NetworkState;
  connections: number;
  peerId: string | null;
}

abstract class CollectorBase<T extends CollectorStateBase> {
  // TODO find a way to use types without loading the actual module...
  protected peer: any;

  protected conns: any[] = [];

  private state: T;

  private handleState: (_: T) => void;

  constructor(handleState: (_: T) => void) {
    this.handleState = handleState;
    this.state = this.initState({
      networkState: NetworkState.OFFLINE,
      connections: 0,
      peerId: null,
    });
    this.handleState(this.state);
    this.initPeer();
  }

  abstract initState(baseState: CollectorStateBase): T;

  protected updateState(newState: Partial<T> | Partial<CollectorStateBase>): void {
    this.state = {
      ...this.state,
      ...newState,
    };
    this.handleState(this.state);
  }

  private async initPeer() {
    this.peer = await import('peerjs').then(({ Peer }) => new Peer({ debug: 3 }));
    this.peer.on('open', this.peerOnOpen.bind(this));
    this.peer.on('connection', this.peerOnConnection.bind(this));
    this.peer.on('error', this.peerOnError.bind(this));
  }

  protected addConn(conn: any) {
    this.conns.push(conn);
    conn.on('open', this.connOnOpen.bind(this, conn));
    conn.on('data', this.connOnData.bind(this, conn));
    conn.on('error', this.connOnError.bind(this, conn));
    conn.on('close', this.connOnClose.bind(this, conn));
  }

  protected peerOnOpen(peerId: string): void {
    this.updateState({
      networkState: NetworkState.OPEN,
      peerId,
    });
  }

  protected peerOnConnection(conn: any): void {
    this.addConn(conn);
    this.updateState({
      networkState: NetworkState.CONNECTED,
      connections: this.conns.length,
    });
  }

  protected peerOnError(): void {
    this.updateState({
      networkState: NetworkState.ERROR,
      connections: 0,
      peerId: null,
    });
    // TODO cleanup & retry?
  }

  protected connOnOpen(conn: any): void {
    if (this.conns.indexOf(conn) === -1) {
      this.addConn(conn);
    }
    this.updateState({
      networkState: NetworkState.CONNECTED,
      connections: this.conns.length,
    });
  }

  protected connOnClose(conn: any): void {
    this.conns.splice(this.conns.indexOf(conn), 1);
    this.updateState({
      networkState: this.conns.length > 0 ? NetworkState.CONNECTED : NetworkState.OPEN,
      connections: this.conns.length,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected connOnError(conn: any): void {
    // TODO what if only one connection of many fails?
    this.updateState({
      networkState: NetworkState.ERROR,
    });
    // TODO cleanup & retry?
  }

  abstract connOnData(conn: any, data: unknown): void;

  public get connectedPeers() {
    return this.conns.length;
  }

  public get peerId(): string {
    return this.peer?.id;
  }

  public getState(): T {
    return this.state;
  }

  public destroy(): void {
    for (let i = 0; i < this.conns.length; i++) {
      this.conns[i].close();
    }
    if (this.peer !== undefined) {
      this.peer.destroy();
    }
  }
}

export interface CollectorStateServer extends CollectorStateBase {}

export class CollectorServer extends CollectorBase<CollectorStateServer> {
  private members: Member[];

  private callback: (updates: WeightUpdate[]) => void;

  constructor(
    members: Member[],
    callback: (updates: WeightUpdate[]) => void,
    handleState: (_: CollectorStateServer) => void
  ) {
    super(handleState);
    this.members = members;
    this.callback = callback;
  }

  initState(baseState: CollectorStateBase): CollectorStateServer {
    return baseState;
  }

  protected connOnOpen(conn: any): void {
    console.log(`Onboarding peer ${conn.peer} with ${this.members}`);
    conn.send(JSON.stringify(this.members));
  }

  connOnData(conn: any, data: unknown): void {
    const { token, payload } = JSON.parse(data as string) as ClientData;
    const srcIdx = this.members.findIndex((m) => m.id === token);
    if (srcIdx === -1) {
      console.error(`${conn.connectionId} has sent illegal token ${token}. Ignoring...`);
      return;
    }
    this.callback(
      payload.map((base) => ({
        sourceId: token,
        ...base,
      }))
    );
  }

  public setCallback(callback: (updates: WeightUpdate[]) => void) {
    this.callback = callback;
  }

  public setMembers(members: Member[]) {
    this.members = members;
    for (let i = 0; i < this.conns.length; i++) {
      this.conns[i].send(JSON.stringify(this.members));
    }
  }
}

export interface CollectorStateClient extends CollectorStateBase {
  members: Member[];
}

export class CollectorClient extends CollectorBase<CollectorStateClient> {
  private members: Member[] = [];

  private serverPeer: string;

  constructor(serverPeer: string, handleState: (_: CollectorStateClient) => void) {
    super(handleState);
    this.serverPeer = serverPeer;
  }

  initState(baseState: CollectorStateBase): CollectorStateClient {
    return {
      members: [],
      ...baseState,
    };
  }

  protected peerOnOpen(peerId: string): void {
    super.peerOnOpen(peerId);
    this.addConn(this.peer.connect(this.serverPeer));
  }

  connOnData(conn: any, data: unknown): void {
    this.members = JSON.parse(data as string) as ServerOpen;
    this.updateState({
      members: this.members,
    });
  }

  public updateWeight(srcId: string, trgId: string, weight: number) {
    const req: ClientData = {
      token: srcId,
      done: false,
      payload: [
        {
          targetId: trgId,
          weight,
        },
      ],
    };
    for (let i = 0; i < this.conns.length; i++) {
      this.conns[i].send(JSON.stringify(req));
    }
  }
}
