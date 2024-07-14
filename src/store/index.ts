import { configureStore } from "@reduxjs/toolkit";
import { gameInitialState, gameReducer, GameState } from "./slice/game";
import { settingsInitialState, settingsReducer, SettingsState } from "./slice/settings";
import { statsInitialState, statsReducer, StatsState } from "./slice/stats";
import { uiInitialState, uiReducer, UiState } from "./slice/ui";

/*
export type Dispatcher = Dispatch<Action<RootState>>;
export const useDispatcher = (): Dispatcher => useDispatch<RootState>();
*/

export type RootState = {
  game: GameState;
  settings: SettingsState;
  stats: StatsState;
  ui: UiState;
};
export const initialState: RootState = {
  game: gameInitialState,
  settings: settingsInitialState,
  stats: statsInitialState,
  ui: uiInitialState,
};

// Create root reducer by reducing reducers
// (I don't really want to use https://github.com/redux-utilities/reduce-reducers)
const reducers = [gameReducer, settingsReducer, statsReducer, uiReducer];

export const store = configureStore<RootState>({
  reducer: (state, action) => reducers.reduce((s, r) => r(s, action), state)!,
});

export type AppDispatch = typeof store.dispatch;

// Reexports
export * from "./debug";
export * from "./hooks";
export * from "./selector";
export * from "./slice/game";
export * from "./slice/settings";
export * from "./slice/stats";
export * from "./slice/ui";
