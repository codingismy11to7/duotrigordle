import { createAction, createReducer } from "@reduxjs/toolkit";
import { castDraft } from "immer";
import { initialState, insertHistory } from "..";
import { NUM_BOARDS, NUM_GUESSES, WORDS_VALID } from "../../consts";
import { defined, getAllWordsGuessed, getCompletedBoards, getTargetWords, range } from "../../funcs";

export type GameState = Readonly<{
  // Daily Duotrigordle number (seed for target words)
  id: number;
  // Current word input
  input: string;
  // List of guesses
  guesses: readonly string[];
  // 32 wordle targets
  targets: readonly string[];
  // Whether or not the game is finished
  gameOver: boolean;
  // Whether or not the game is in practice mode
  practice: boolean;
  // Start timestamp (milliseconds from unix epoch)
  startTime: number;
  // End timestamp (milliseconds from unix epoch)
  endTime: number;
}>;
export const gameInitialState: GameState = {
  id: 0,
  input: "",
  guesses: [],
  targets: range(NUM_BOARDS).map(() => "AAAAA"),
  gameOver: false,
  practice: true,
  startTime: 0,
  endTime: 0,
};

export const loadGame = createAction<{ game: GameState }>("game/loadGame");
export const startGame = createAction<{ id: number; practice: boolean }>("game/startGame");
export const inputLetter = createAction<{ letter: string }>("game/inputLetter");
export const inputBackspace = createAction("game/inputBackspace");
export const inputEnter = createAction<{ timestamp: number }>("game/inputEnter");

export const gameReducer = createReducer(
  () => initialState,
  builder =>
    builder
      .addCase(loadGame, (state, action) => {
        state.game = castDraft(action.payload.game);
        state.ui.highlightedBoard = undefined;
      })
      .addCase(startGame, (state, action) => {
        state.game = {
          id: action.payload.id,
          targets: getTargetWords(action.payload.id),
          guesses: [],
          input: "",
          gameOver: false,
          practice: action.payload.practice,
          startTime: 0,
          endTime: 0,
        };
        state.ui.highlightedBoard = undefined;
      })
      .addCase(inputLetter, (state, action) => {
        const game = state.game;
        if (game.gameOver) return;
        if (game.input.length < 5) {
          game.input += action.payload.letter;
        }
      })
      .addCase(inputBackspace, state => {
        const game = state.game;
        if (game.gameOver) return;
        game.input = game.input.substring(0, game.input.length - 1);
      })
      .addCase(inputEnter, (state, action) => {
        const game = state.game;
        if (game.gameOver) return;

        const guess = game.input;
        game.input = "";
        if (!WORDS_VALID.has(guess)) {
          return;
        }
        game.guesses.push(guess);
        // Start timer on first guess
        if (game.guesses.length === 1) {
          game.startTime = action.payload.timestamp;
        }

        if (game.guesses.length === NUM_GUESSES || getAllWordsGuessed(game.targets, game.guesses)) {
          // Game over
          game.gameOver = true;
          game.endTime = action.payload.timestamp;

          // Add stat to game history
          if (!game.practice) {
            const gameHistory = {
              id: game.id,
              guesses: game.guesses.length,
              time: game.endTime - game.startTime,
            };
            state.stats.history = insertHistory(state.stats.history, gameHistory);
          }

          // Clear board highlights
          state.ui.highlightedBoard = undefined;
        } else {
          // Check if highlighted board is invalid, then shift right until it isn't
          if (!defined(state.ui.highlightedBoard)) return;
          const completedBoards = getCompletedBoards(game.targets, game.guesses);
          let i = state.ui.highlightedBoard;
          const start = i;
          while (completedBoards[i]) {
            i = (i + 1) % completedBoards.length;
            if (i === start) {
              break;
            }
          }
          state.ui.highlightedBoard = i;
        }
      }),
);
