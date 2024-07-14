import { Option, pipe } from "effect";
import { useEffect, useLayoutEffect, useState } from "react";
import { z } from "zod";
import { NUM_GUESSES } from "../consts";
import { getAllWordsGuessed, getTargetWords, getTodaysId } from "../funcs";
import {
  AppDispatch,
  GameState,
  loadGame,
  loadStats,
  parseSettingsState,
  parseStatsState,
  SettingsState,
  startGame,
  StatsState,
  updateSettings,
  useAppDispatch,
  useSelector,
} from "../store";

const SettingsKey = "duotrigordle-settings";
const StateKey = "duotrigordle-state";
const StatsKey = "duotrigordle-stats";

// This component doesn't actually render anything, but it manages
// saving & loading state from local storage
export default function useLocalStorage() {
  const dispatch = useAppDispatch();
  const [loaded, setLoaded] = useState(false);

  useLayoutEffect(() => {
    if (!loaded) {
      setLoaded(true);
      loadGameFromLocalStorage(dispatch);
      loadSettingsFromLocalStorage(dispatch);
      loadStatsFromLocalStorage(dispatch);
    }
  }, [dispatch, loaded]);

  const game = useSelector(s => s.game);
  useEffect(() => {
    if (loaded && !game.practice) {
      saveGameToLocalStorage(game);
    }
  }, [game, loaded]);
  const settings = useSelector(s => s.settings);
  useEffect(() => {
    if (loaded) {
      saveSettingsToLocalStorage(settings);
    }
  }, [settings, loaded]);
  const stats = useSelector(s => s.stats);
  useEffect(() => {
    if (loaded) {
      saveStatsToLocalStorage(stats);
    }
  }, [stats, loaded]);
}

// Serialization for game
const GameSerialized = z.object({
  id: z.number(),
  guesses: z.string().array().max(NUM_GUESSES).readonly(),
  startTime: z.number(),
  endTime: z.number(),
});
type GameSerialized = z.infer<typeof GameSerialized>;
const parseGameSerialized = (x: unknown) =>
  pipe(GameSerialized.safeParse(x), r => (r.success ? Option.some(r.data) : Option.none()));

const serializeGame = (state: GameState): GameSerialized => ({
  id: state.id,
  guesses: state.guesses,
  startTime: state.startTime,
  endTime: state.endTime,
});
function deserializeGame(serialized: GameSerialized): GameState {
  const targets = getTargetWords(serialized.id);
  const gameOver = serialized.guesses.length === NUM_GUESSES || getAllWordsGuessed(targets, serialized.guesses);
  return {
    id: serialized.id,
    input: "",
    targets,
    guesses: serialized.guesses,
    gameOver,
    practice: false,
    startTime: serialized.startTime,
    endTime: serialized.endTime,
  };
}
export const loadGameFromLocalStorage = (dispatch: AppDispatch) =>
  pipe(getTodaysId(), todaysId =>
    pipe(
      localStorage.getItem(StateKey),
      Option.fromNullable,
      Option.andThen(t => JSON.parse(t) as unknown),
      Option.andThen(parseGameSerialized),
      Option.filter(({ id }) => id === todaysId),
      Option.andThen(deserializeGame),
      Option.match({
        onNone: () => startGame({ id: todaysId, practice: false }),
        onSome: game => loadGame({ game: game }),
      }),
      dispatch,
    ),
  );
function saveGameToLocalStorage(state: GameState) {
  localStorage.setItem(StateKey, JSON.stringify(serializeGame(state)));
}

// Serialization for settings
const loadSettingsFromLocalStorage = (dispatch: AppDispatch) =>
  pipe(
    localStorage.getItem(SettingsKey),
    Option.fromNullable,
    Option.andThen(s => JSON.parse(s) as unknown),
    Option.andThen(parseSettingsState),
    Option.andThen(updateSettings),
    Option.andThen(dispatch),
  );
function saveSettingsToLocalStorage(state: SettingsState) {
  localStorage.setItem(SettingsKey, JSON.stringify(state));
}

// Serialization for stats
const loadStatsFromLocalStorage = (dispatch: AppDispatch) =>
  pipe(
    localStorage.getItem(StatsKey),
    Option.fromNullable,
    Option.andThen(s => JSON.parse(s) as unknown),
    Option.andThen(parseStatsState),
    Option.andThen(loadStats),
    Option.andThen(dispatch),
  );
function saveStatsToLocalStorage(state: StatsState) {
  localStorage.setItem(StatsKey, JSON.stringify(state));
}
