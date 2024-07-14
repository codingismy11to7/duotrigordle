import { createAction, createReducer } from "@reduxjs/toolkit";
import { Option, pipe } from "effect";
import { castDraft } from "immer";
import { z } from "zod";
import { initialState } from "..";
import { PRACTICE_MODE_MIN_ID } from "../../consts";

const GameHistory = z.object({
  id: z.number(),
  guesses: z.number().optional(),
  time: z.number(),
});
export type GameHistory = z.infer<typeof GameHistory>;
export const StatsState = z.object({
  history: GameHistory.array().readonly(),
});
export type StatsState = z.infer<typeof StatsState>;
export const parseStatsState = (x: unknown) =>
  pipe(StatsState.safeParse(x), r => (r.success ? Option.some(r.data) : Option.none()));
export const statsInitialState: StatsState = {
  history: [],
};

export const loadStats = createAction<StatsState>("stats/loadStats");

export const statsReducer = createReducer(
  () => initialState,
  builder =>
    builder.addCase(loadStats, (state, action) => {
      state.stats = castDraft(action.payload);
      state.stats.history = normalizeHistory(state.stats.history);
    }),
);

export function insertHistory(history: readonly GameHistory[], game: GameHistory) {
  return normalizeHistory(history.filter(v => v.id !== game.id).concat(game));
}

export function normalizeHistory(history: readonly GameHistory[]) {
  const mutableHistUntilIFix = [...history];

  // Remove practice mode games (in case they were added by accident)
  for (let i = 0; i < mutableHistUntilIFix.length; i++) {
    if (mutableHistUntilIFix[i].id >= PRACTICE_MODE_MIN_ID) {
      mutableHistUntilIFix.splice(i, 1);
      i--;
    }
  }
  // Remove duplicate ids
  const visited = new Set();
  for (let i = 0; i < mutableHistUntilIFix.length; i++) {
    if (visited.has(mutableHistUntilIFix[i])) {
      mutableHistUntilIFix.splice(i, 1);
      i--;
    } else {
      visited.add(mutableHistUntilIFix[i]);
    }
  }
  // Sort ids
  mutableHistUntilIFix.sort((a, b) => a.id - b.id);
  return mutableHistUntilIFix;
}
