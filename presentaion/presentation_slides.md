# Briefly CRM — 3-Slide Architectural Presentation

This slide deck is optimized for your graduation project defense. Each slide features an implementation-level architecture diagram, a maximum of 5 technical bullet points, and 45-second speaker notes.

---

## Slide 1: Real-Time Inbound Webhook Pipeline

### Architecture Diagram
```mermaid
graph LR
    Customer[Customer App] -- 1. Sends Msg --> Meta[Meta Graph API]
    Meta -- "2. HTTPS POST" --> Hook[Express Webhook Router]
    Hook -- "3. immediate ack (200)" --> Meta
    Hook -- "4. Enqueues job" --> WebhookQueue[BullMQ: Webhook Queue]
    WebhookQueue --> Worker[Messaging Worker]
    Worker --> Idempotency{Idempotency Check}
    Idempotency -- "Pass" --> DB[(PostgreSQL DB)]
    Worker -- "5. Socket Broadcast" --> Gateway[Socket.io Gateway]
    Gateway --> Agent[Agent UI]

    style Hook fill:#f9f,stroke:#333,stroke-width:2px
    style WebhookQueue fill:#bbf,stroke:#333,stroke-width:2px
    style Worker fill:#bfb,stroke:#333,stroke-width:2px
    style DB fill:#ffb,stroke:#333,stroke-width:2px
```

### Technical Highlights
* **Decoupled Processing:** Signature-verified HTTPS webhooks hand off Meta payloads to BullMQ queues, freeing the main Express thread.
* **Immediate Acknowledgment:** Webhooks reply with `200 EVENT_RECEIVED` under 3 seconds to prevent Meta from initiating retry loops.
* **Idempotency Guard:** Atomic DB checks ignore redundant webhook delivery attempts using Meta `mid` transaction hashes.
* **Media Normalization:** Media buffers (audio, image, document) are fetched asynchronously, uploaded to Backblaze B2, and stored as signed URLs.
* **Real-time Event Invalidation:** Socket.io pushes events to conversation rooms, updating the client's cache without polling.

### 🎙️ Speaker Notes (Time: 45 seconds ~ 110 words)
> "When a customer sends a message on WhatsApp or Messenger, Meta triggers our secure Express webhook endpoint. To ensure the system remains resilient under load, we perform a timing-safe signature check and validation, reply with a 200 OK immediately, and hand the payload off to our Redis-backed BullMQ Webhook Queue. 
>
> An async worker process retrieves the message, verifies it against our idempotency ledger to filter out duplicates, downloads and uploads any media attachments to Backblaze B2, and writes to PostgreSQL. Finally, the worker broadcasts the message via Socket.io to the agent's browser, updating their workspace in real-time."

---

## Slide 2: High-Performance Frontend & Optimistic UI

### Architecture Diagram
```mermaid
sequenceDiagram
    actor Agent
    participant Cache as TanStack Query Cache
    participant UploadStore as Zustand Upload Store
    participant API as Express API
    participant S3 as Backblaze B2 Storage
    participant Queue as BullMQ (Outbound Queue)

    Agent->>Cache: 1. Send text or select file
    Note over Cache: Appends Optimistic PENDING bubble
    opt Media Attachment
        Agent->>API: 2a. Request Presigned URL
        API-->>Agent: 2b. Returns Upload URL & Message ID
        Agent->>S3: 2c. PUT Binary file (Zustand tracks progress)
        Agent->>API: 2d. POST /complete-upload
    end
    Agent->>API: 3. POST /messages (Write PENDING)
    API->>Queue: 4. Enqueue Outbound Job
    API-->>Agent: 5. 200 OK (Queued)
```

### Technical Highlights
* **Optimistic Rendering:** Sends are appended to the TanStack Query cache instantly with `PENDING` states to eliminate UI lag.
* **Direct Storage Uploads:** Media files bypass the application server entirely, uploading directly to Backblaze B2 via secure presigned PUT URLs.
* **Zustand Progress Engine:** Tracks progress of active chunked uploads, handling cancellations via native `AbortController` signals.
* **Outbound Queue Dispatch:** Agent replies are committed as `PENDING` in the DB and enqueued into BullMQ for delivery via Meta Graph REST API.
* **State Reconciliation:** WebSockets emit status updates (`SENT`, `DELIVERED`, `READ`), swapping optimistic placeholders with final payloads.

### 🎙️ Speaker Notes (Time: 45 seconds ~ 110 words)
> "To keep the workspace responsive, Briefly CRM uses optimistic UI rendering. When an agent clicks send, the frontend immediately appends a pending bubble to the screen. For media attachments, the client requests a presigned URL from our backend, and uploads the file directly to Backblaze B2. Our Zustand store monitors the upload progress. 
>
> Once the upload finishes or a text reply is sent, the backend writes a pending message to PostgreSQL and enqueues the outbound dispatch job in BullMQ. This decoupling allows the API request to resolve immediately. The worker sends the message via Meta's Graph API and updates the status to sent."

---

## Slide 3: Horizontal DevOps & Database Scaling

### Architecture Diagram
```mermaid
graph TD
    ALB[Application Load Balancer] --> Express1[Express Server Node 1]
    ALB --> Express2[Express Server Node 2]
    
    Express1 -- Handshake Session --> BetterAuth[Better Auth Engine]
    Express2 -- Handshake Session --> BetterAuth
    
    Express1 <--> RedisAdapter[Redis Adapter Pub/Sub]
    Express2 <--> RedisAdapter
    RedisAdapter <--> Redis[(Redis Cluster)]
    
    Express1 --> DB[(PostgreSQL Database)]
    Express2 --> DB
    
    Redis --> Worker1[BullMQ Outbound Worker]
    Redis --> Worker2[BullMQ Webhook Worker]

    style Redis fill:#ffb,stroke:#333,stroke-width:2px
    style RedisAdapter fill:#bbf,stroke:#333,stroke-width:2px
    style DB fill:#bfb,stroke:#333,stroke-width:2px
```

### Technical Highlights
* **State-Free API Nodes:** Express server instances run stateless, relying on Better Auth for distributed session authentication.
* **Redis Pub/Sub Socket Adapter:** Broadside messaging events traverse horizontally across servers, enabling multi-node WebSocket routing.
* **Prisma Schema Isolation:** A fully normalized PostgreSQL schema isolates domains across Customers, Conversations, Messages, and Tickets.
* **Transaction Integrity:** Ticket operations (e.g. adding notes) run in Prisma database transactions, updating response timelines atomically.
* **Resilient Retry Mechanics:** Workers isolate third-party service failures, triggering automatic exponential backoffs on network dropouts.

### 🎙️ Speaker Notes (Time: 45 seconds ~ 110 words)
> "Finally, Briefly CRM is engineered to scale horizontally. By designing stateless Express servers behind a load balancer, we can spin up new instances dynamically. We use Redis as a shared state hub for rate-limiting, job queue distribution, and WebSocket coordination. 
>
> Through the Socket.io Redis adapter, servers automatically synchronize message events across different nodes via Pub/Sub. In the database layer, PostgreSQL and Prisma enforce strict relations between customer metrics, chat threads, and support tickets. If any Meta API request fails due to rate limits or network issues, our workers execute an exponential backoff policy, ensuring high system reliability."
