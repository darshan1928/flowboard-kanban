import reducer, {
  optimisticMoveStage,
  rollbackMoveStage,
  optimisticRemove,
  rollbackRemove,
  loadTasks,
  moveTaskStage,
  selectTaskCounts,
  selectTasksByStage,
} from "./tasksSlice";

const sampleTask = (overrides = {}) => ({
  id: "t1",
  userId: "u1",
  name: "Write PRD",
  stage: 0,
  priority: "high",
  deadline: "2026-09-20",
  createdAt: 1,
  updatedAt: 1,
  ...overrides,
});

function seededState(tasks) {
  const byId = {};
  const allIds = [];
  tasks.forEach((t) => {
    byId[t.id] = t;
    allIds.push(t.id);
  });
  return { byId, allIds, status: "succeeded", error: null, pendingMoveSnapshots: {} };
}

describe("tasksSlice reducer", () => {
  test("loadTasks.fulfilled normalizes the task list into byId/allIds", () => {
    const state = reducer(undefined, loadTasks.fulfilled([sampleTask()], "reqId"));
    expect(state.allIds).toEqual(["t1"]);
    expect(state.byId.t1.name).toBe("Write PRD");
    expect(state.status).toBe("succeeded");
  });

  test("optimisticMoveStage updates stage immediately and records a rollback snapshot", () => {
    const initial = seededState([sampleTask({ stage: 0 })]);
    const next = reducer(initial, optimisticMoveStage({ id: "t1", stage: 1 }));
    expect(next.byId.t1.stage).toBe(1);
    expect(next.pendingMoveSnapshots.t1).toBe(0);
  });

  test("rollbackMoveStage restores the previous stage", () => {
    let state = seededState([sampleTask({ stage: 0 })]);
    state = reducer(state, optimisticMoveStage({ id: "t1", stage: 2 }));
    state = reducer(state, rollbackMoveStage({ id: "t1" }));
    expect(state.byId.t1.stage).toBe(0);
    expect(state.pendingMoveSnapshots.t1).toBeUndefined();
  });

  test("moveTaskStage.rejected rolls back to the snapshot taken before the optimistic update", () => {
    let state = seededState([sampleTask({ stage: 1 })]);
    state = reducer(state, optimisticMoveStage({ id: "t1", stage: 2 }));
    const rejectedAction = {
      type: moveTaskStage.rejected.type,
      meta: { arg: { id: "t1", stage: 2 } },
      payload: { id: "t1", message: "network error" },
    };
    state = reducer(state, rejectedAction);
    expect(state.byId.t1.stage).toBe(1);
  });

  test("optimisticRemove hides a task from allIds without losing its data, rollbackRemove restores it", () => {
    let state = seededState([sampleTask()]);
    state = reducer(state, optimisticRemove("t1"));
    expect(state.allIds).not.toContain("t1");

    state = reducer(state, rollbackRemove("t1"));
    expect(state.allIds).toContain("t1");
    expect(state.byId.t1.name).toBe("Write PRD");
  });
});

describe("tasksSlice selectors", () => {
  test("selectTasksByStage groups tasks under their numeric stage", () => {
    const state = {
      tasks: seededState([
        sampleTask({ id: "t1", stage: 0 }),
        sampleTask({ id: "t2", stage: 3 }),
      ]),
    };
    const grouped = selectTasksByStage(state);
    expect(grouped[0]).toHaveLength(1);
    expect(grouped[3]).toHaveLength(1);
    expect(grouped[1]).toHaveLength(0);
  });

  test("selectTaskCounts derives total/done/pending without double counting", () => {
    const state = {
      tasks: seededState([
        sampleTask({ id: "t1", stage: 0 }),
        sampleTask({ id: "t2", stage: 3 }),
        sampleTask({ id: "t3", stage: 3 }),
      ]),
    };
    expect(selectTaskCounts(state)).toEqual({ total: 3, done: 2, pending: 1 });
  });
});
