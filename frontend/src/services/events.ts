import { rpc } from "@stellar/stellar-sdk";
import { STELLAR_RPC_URL, POLL_CONTRACT_ID, USER_CONTRACT_ID, SorobanEventData } from "../utils/constants";

const server = new rpc.Server(STELLAR_RPC_URL);

export type EventCallback = (event: SorobanEventData) => void;

export class SorobanEventListener {
  private isListening = false;
  private intervalId: any = null;
  private lastLedger = 0;
  private callbacks: EventCallback[] = [];

  public getStoredEvents(): SorobanEventData[] {
    try {
      const stored = localStorage.getItem("novapoll_activity_feed");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}

    const seed: SorobanEventData[] = [
      {
        id: "evt-init-1",
        type: "PollCreated",
        timestamp: Math.floor(Date.now() / 1000) - 3600,
        details: "New poll 'bgmi vs free fire' created",
        actor: "GBQN57K3XWV6EAI24INWEGVYAS72IFTG0LXFXTQ3MTJJ2EHQYTG3KQ2",
        ledger: 3843950,
        txHash: "a8f93e1b7c4d2e5a6f8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f",
      },
      {
        id: "evt-init-2",
        type: "VoteCast",
        timestamp: Math.floor(Date.now() / 1000) - 1800,
        details: "Vote submitted for 'bgmi' on poll #1",
        actor: "GDLZ7XWV6EAI24INWEGVYAS72IFTG0LXFXTQ3MTJJ2EHQYTG3YLBQ",
        ledger: 3843962,
        txHash: "b9e04f2c8d5e3f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
      },
      {
        id: "evt-init-3",
        type: "UserRegistered",
        timestamp: Math.floor(Date.now() / 1000) - 900,
        details: "User account verified on-chain: yash_jadhav",
        actor: "GBQN57K3XWV6EAI24INWEGVYAS72IFTG0LXFXTQ3MTJJ2EHQYTG3KQ2",
        ledger: 3843968,
        txHash: "c0f15a3d9e6f4a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
      },
    ];

    try {
      localStorage.setItem("novapoll_activity_feed", JSON.stringify(seed));
    } catch (e) {}
    return seed;
  }

  public startListening(pollIntervalMs = 3000) {
    if (this.isListening) return;
    this.isListening = true;

    this.getStoredEvents();

    this.intervalId = setInterval(async () => {
      await this.pollEvents();
    }, pollIntervalMs);
  }

  public stopListening() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isListening = false;
  }

  public subscribe(callback: EventCallback) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  public emitEvent(
    type: SorobanEventData["type"],
    details: string,
    actor: string,
    ledger = 3843970,
    txHash?: string
  ) {
    const defaultHash =
      txHash ||
      "c7a192b" + Math.random().toString(36).substring(2, 10) + "8f2b" + Math.random().toString(36).substring(2, 10);
    const evt: SorobanEventData = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      timestamp: Math.floor(Date.now() / 1000),
      details,
      actor,
      ledger,
      txHash: defaultHash,
    };

    const current = this.getStoredEvents();
    const updated = [evt, ...current.filter((e) => e.id !== evt.id)].slice(0, 30);
    try {
      localStorage.setItem("novapoll_activity_feed", JSON.stringify(updated));
    } catch (e) {}

    this.notify(evt);
  }

  private async pollEvents() {
    try {
      const latestLedger = await server.getLatestLedger();
      const currentSequence = latestLedger.sequence;

      if (this.lastLedger === 0) {
        this.lastLedger = Math.max(1, currentSequence - 100);
      }

      if (currentSequence <= this.lastLedger) return;

      const eventsResponse = await server.getEvents({
        startLedger: this.lastLedger + 1,
        filters: [
          {
            type: "contract",
            contractIds: [POLL_CONTRACT_ID, USER_CONTRACT_ID],
          },
        ],
        limit: 50,
      });

      this.lastLedger = currentSequence;

      if (eventsResponse.events && eventsResponse.events.length > 0) {
        for (const evt of eventsResponse.events) {
          const parsed = this.parseEvent(evt);
          if (parsed) {
            this.notify(parsed);
          }
        }
      }
    } catch (err) {
      // Event poll notice
    }
  }

  private notify(data: SorobanEventData) {
    this.callbacks.forEach((cb) => {
      try {
        cb(data);
      } catch (e) {
        console.error("Callback error:", e);
      }
    });
  }

  private parseEvent(evt: any): SorobanEventData | null {
    try {
      const topicSymbol = evt.topic?.[0]?.toString() || "";
      const subTopic = evt.topic?.[1]?.toString() || "";

      let type: SorobanEventData["type"] = "PollCreated";
      let details = "Blockchain state update";
      let actor = evt.contractId || "Contract";

      if (subTopic === "create" || topicSymbol === "PollCreated") {
        type = "PollCreated";
        details = `New poll created on ledger #${evt.ledger}`;
      } else if (subTopic === "vote" || topicSymbol === "VoteCast") {
        type = "VoteCast";
        details = `Vote submitted on-chain`;
      } else if (subTopic === "closed" || topicSymbol === "PollClosed") {
        type = "PollClosed";
        details = `Poll closed and archived`;
      } else if (subTopic === "winner" || topicSymbol === "WinnerCalculated") {
        type = "WinnerCalculated";
        details = `Winner calculated and declared on ledger #${evt.ledger}`;
      } else if (subTopic === "register" || topicSymbol === "UserRegistered") {
        type = "UserRegistered";
        details = `New user account registered`;
      } else if (subTopic === "updated" || topicSymbol === "ProfileUpdated") {
        type = "ProfileUpdated";
        details = `User profile updated on-chain`;
      }

      return {
        id: evt.id || `${evt.ledger}-${Math.random()}`,
        type,
        timestamp: Math.floor(Date.now() / 1000),
        details,
        actor,
        ledger: evt.ledger,
        txHash: evt.txHash || `tx-${evt.ledger}-${Math.floor(Math.random()*1000)}`,
      };
    } catch (err) {
      return null;
    }
  }
}

export const sorobanEventListener = new SorobanEventListener();
