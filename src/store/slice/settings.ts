import { createAction, createReducer } from "@reduxjs/toolkit";
import { Option, pipe } from "effect";
import { z } from "zod";
import { initialState } from "..";

export const SettingsState = z.object({
  colorBlindMode: z.boolean(),
  showTimer: z.boolean(),
  useFloatingInput: z.boolean(),
  wideMode: z.boolean(),
  hideCompletedBoards: z.boolean(),
  animateHiding: z.boolean(),
  hideKeyboard: z.boolean(),
  hideEmptyRows: z.boolean(),
});
export type SettingsState = z.infer<typeof SettingsState>;
export const parseSettingsState = (x: unknown) =>
  pipe(SettingsState.safeParse(x), r => (r.success ? Option.some(r.data) : Option.none()));

export const settingsInitialState: SettingsState = {
  colorBlindMode: false,
  showTimer: false,
  useFloatingInput: false,
  wideMode: false,
  hideCompletedBoards: false,
  animateHiding: true,
  hideKeyboard: false,
  hideEmptyRows: false,
};

export const updateSettings = createAction<Partial<SettingsState>>("settings/updateSettings");

export const settingsReducer = createReducer(
  () => initialState,
  builder => {
    builder.addCase(updateSettings, (state, action) => {
      state.settings = {
        ...state.settings,
        ...action.payload,
      };
    });
  },
);
