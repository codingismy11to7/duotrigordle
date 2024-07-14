import { ActionCreator, AnyAction } from "@reduxjs/toolkit";
import cn from "classnames";
import React, { Fragment, useEffect, useRef } from "react";
import { NUM_BOARDS, NUM_GUESSES, WORDS_VALID } from "../consts";
import { range } from "../funcs";
import {
  highlightArrowDown,
  highlightArrowLeft,
  highlightArrowRight,
  highlightArrowUp,
  highlightClick,
  highlightEsc,
  resolveSideEffect,
  selectGuessColors,
  useAppDispatch,
  useSelector,
} from "../store";

export default function Boards() {
  const gameOver = useSelector(s => s.game.gameOver);
  const showFloatingInput = useSelector(s => s.settings.useFloatingInput);

  return (
    <>
      <KeyboardListener />
      <div className={cn("boards", "show-input-hint")}>
        {range(NUM_BOARDS).map(i => (
          <Board key={i} idx={i} />
        ))}
        <div className={cn("input-wrapper", (gameOver || !showFloatingInput) && "hidden")}>
          <div className="input">
            <div className="word">
              <InputWord />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const keyMap = new Map<string, ActionCreator<AnyAction>>([
  ["ArrowRight", highlightArrowRight],
  ["ArrowLeft", highlightArrowLeft],
  ["ArrowDown", highlightArrowDown],
  ["ArrowUp", highlightArrowUp],
  ["Escape", highlightEsc],
]);
function KeyboardListener() {
  const dispatch = useAppDispatch();
  const popup = useSelector(s => s.ui.popup);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (popup) {
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }
      let actionCreator;
      if ((actionCreator = keyMap.get(e.key))) {
        e.preventDefault();
        dispatch(actionCreator());
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [dispatch, popup]);

  return <Fragment />;
}

type BoardProps = {
  idx: number;
};
function Board({ idx }: BoardProps) {
  const dispatch = useAppDispatch();
  const guesses = useSelector(s => s.game.guesses);
  const target = useSelector(s => s.game.targets[idx]);
  const gameOver = useSelector(s => s.game.gameOver);
  const colors = useSelector(selectGuessColors)[idx];
  const highlight = useSelector(s => s.ui.highlightedBoard === idx);
  const useFloatingInput = useSelector(s => s.settings.useFloatingInput);
  const hideEmptyRows = useSelector(s => s.settings.hideEmptyRows);
  const guessedAt = guesses.indexOf(target);
  const complete = guessedAt !== -1;
  const guessCount = complete ? guessedAt + 1 : guesses.length;
  const showInput = !complete && !gameOver && (!useFloatingInput || !hideEmptyRows);
  const emptyWordsCount = hideEmptyRows
    ? // If hide empty rows, then show one empty row if input isn't shown and there are no guesses
      !showInput && guessCount === 0
      ? 1
      : 0
    : // Otherwise, pad empty rows
      NUM_GUESSES - guessCount - (showInput ? 1 : 0);

  const ref = useRef<HTMLDivElement>(null);
  const sideEffect = useSelector(s => s.ui.sideEffects[0] ?? null);
  useEffect(() => {
    if (sideEffect && sideEffect.type === "scroll-board-into-view" && sideEffect.board === idx) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      dispatch(resolveSideEffect(sideEffect.id));
    }
  }, [dispatch, idx, sideEffect]);

  return (
    <div
      className={cn("board", complete && !gameOver && "complete", highlight && "highlight")}
      onClick={() => dispatch(highlightClick(idx))}
    >
      <div ref={ref} className="scroll-into-view" />
      <ColoredWords words={guesses} colors={colors} count={guessCount} />
      {showInput && <InputWord />}
      <EmptyWords count={emptyWordsCount} />
    </div>
  );
}

type ColoredWordsProps = {
  words: readonly string[];
  colors: readonly string[];
  count: number;
};
const ColoredWordsRenderer = ({ words, colors, count }: ColoredWordsProps) => (
  <>
    {range(count).map(i => (
      <Word key={i} letters={words[i]} colors={colors[i]} />
    ))}
  </>
);
const ColoredWords = React.memo(ColoredWordsRenderer);

type EmptyWordsProps = {
  count: number;
};
const EmptyWordsRenderer = ({ count }: EmptyWordsProps) => (
  <>
    {range(count).map(i => (
      <Word key={i} letters="" />
    ))}
  </>
);
const EmptyWords = React.memo(EmptyWordsRenderer);

function InputWord() {
  const input = useSelector(s => s.game.input);
  return <Word letters={input} textRed={input.length === 5 && !WORDS_VALID.has(input)} />;
}

type WordProps = {
  letters: string;
  colors?: string;
  textRed?: boolean;
  inputId?: number;
};
const WordRenderer = function (props: WordProps) {
  return (
    <>
      {range(5).map(i => (
        <Cell
          key={i}
          inputId={i === 0 ? props.inputId : undefined}
          char={props.letters[i] ?? ""}
          textRed={props.textRed}
          color={props.colors?.[i] as "B" | undefined /* TODO fix the colors to be strongly typed and a 5-tuple */}
        />
      ))}
    </>
  );
};
const Word = React.memo(WordRenderer);

type CellProps = {
  char: string;
  color?: "B" | "Y" | "G";
  inputId?: number;
  textRed?: boolean;
};
function Cell({ char, color, inputId, textRed }: CellProps) {
  const colorStyle = color === "Y" ? "yellow" : color === "G" ? "green" : color === "B" ? "gray" : null;
  const textRedStyle = textRed ? "text-red" : null;
  const id = inputId !== undefined ? `input-${inputId + 1}` : undefined;
  return (
    <div id={id} className={cn("cell", colorStyle, textRedStyle)}>
      <span className="letter">{char}</span>
    </div>
  );
}
