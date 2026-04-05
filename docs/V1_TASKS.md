# V1 Development Breakdown

## 1. Goal

Deliver a minimal prototype that proves:

- host/runtime separation works
- Codex can be used as the first runtime
- group/task/message flow still works end to end

## 2. Milestones

### Milestone A: Repository Foundation

Deliverables:

- project structure
- base TypeScript or Node runtime setup
- configuration model
- logging baseline

Tasks:

- create `src/host`, `src/runtime`, `src/storage`, `src/channels`, `src/scheduler`
- define config loading and environment model
- add linting and formatting
- add README architecture references

### Milestone B: Runtime Contract

Deliverables:

- stable runtime interface
- runtime event schema
- runtime capability schema

Tasks:

- define `AgentRuntime`
- define session and turn input/output types
- define event normalization model
- define runtime error model

### Milestone C: Group and Queue Core

Deliverables:

- group model
- per-group queue
- session metadata persistence

Tasks:

- implement `GroupManager`
- implement per-group FIFO queue
- persist task metadata and basic transcript records
- define group working directory layout

### Milestone D: Local/Dev Channel

Deliverables:

- one input path for manual testing

Tasks:

- create a local test channel or CLI channel
- map inbound message to group task
- print streamed outbound events

### Milestone E: Codex Runtime Prototype

Deliverables:

- first `CodexRuntime`

Tasks:

- create runtime session bootstrap
- load working directory and memory files
- execute one turn through Codex path
- stream runtime events back to host
- map errors into normalized host errors

### Milestone F: Memory and Working Directory Isolation

Deliverables:

- group memory
- isolated workspace mapping

Tasks:

- define global vs group memory files
- mount or expose only group-scoped working directory
- persist local session context

### Milestone G: Scheduler

Deliverables:

- one-shot and recurring tasks

Tasks:

- schedule one-shot task execution
- schedule recurring task execution
- route scheduled jobs through same queue/runtime path

### Milestone H: Validation

Deliverables:

- V1 validation checklist
- demo scenarios

Tasks:

- test single-turn group message
- test multi-turn group session
- test scheduled task
- test working directory isolation
- test runtime failure handling

## 3. Suggested Repository Structure

```text
nanoclaw-codex/
  README.md
  docs/
    ARCHITECTURE.md
    V1_TASKS.md
  src/
    host/
    runtime/
      codex/
    storage/
    channels/
    scheduler/
    sandbox/
    types/
```

## 4. V1 Must-Pass Checklist

### Must Pass

- host can receive one message
- message is routed to a group
- group queue executes serially
- runtime can stream output back
- scheduled task runs through same execution path
- group memory is isolated

### Should Pass

- runtime cancellation
- basic usage accounting
- retry handling for transient runtime failure

### Later

- multi-runtime router
- external channels
- richer tool integration
- advanced auth management

## 5. First Demo Scenario

Recommended first demo:

1. create a local group
2. send a message asking for a short structured brief
3. execute via `CodexRuntime`
4. persist transcript
5. schedule the same group to run a recurring follow-up task

If this works end to end, the architecture is validated enough to move into iteration two.
