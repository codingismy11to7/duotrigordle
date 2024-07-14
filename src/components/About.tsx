import cn from "classnames";
import React, { useEffect, useState } from "react";
import { START_DATE } from "../consts";
import { showPopup, useAppDispatch, useSelector } from "../store";

function getHoursRemaining() {
  const diff = Date.now() - START_DATE;
  const hoursRemaining = 24 - ((diff / 1000 / 60 / 60) % 24);
  if (hoursRemaining > 0.95) {
    return hoursRemaining.toFixed(0);
  } else {
    return hoursRemaining.toFixed(1);
  }
}
export default function About() {
  const dispatch = useAppDispatch();
  const [hoursRemaining, setHoursRemaining] = useState(getHoursRemaining);
  const shown = useSelector(s => s.ui.popup === "about");

  useEffect(() => {
    // Update hoursRemaining every time popup is opened
    if (shown) {
      setHoursRemaining(getHoursRemaining);
    }
  }, [shown]);

  return (
    <div className={cn("popup-wrapper", !shown && "hidden")}>
      <div className="popup">
        <p>Guess all 32 Duotrigordle words in 37 tries!</p>
        <p>
          A new Daily Duotrigordle will be available in {hoursRemaining} hour
          {hoursRemaining === "1" ? "" : "s"}.
        </p>
        <hr className="separator" />
        <p>
          <a target="_blank" href="https://duotrigordle.com" rel="noreferrer">
            Duotrigordle
          </a>{" "}
          by Bryan Chen
        </p>
        <p>Board highlight idea by Dr. Om Patel</p>
        <div>
          Source code on{" "}
          <a rel="noreferrer" target="_blank" href="https://github.com/codingismy11to7/duotrigordle">
            GitHub
          </a>
          <div className="kofi">
            💛 Duotrigordle?{" "}
            <a target="_blank" href="https://ko-fi.com/thesilican" rel="noreferrer">
              Buy Bryan a ☕️!
            </a>
          </div>
        </div>
        <hr className="separator" />
        <p>Based on</p>
        <ul>
          <li>
            <a rel="noreferrer" target="_blank" href="https://hexadecordle.co.uk/">
              Hexadecordle
            </a>{" "}
            by Alfie Rayner
          </li>
          <li>
            <a rel="noreferrer" target="_blank" href="https://octordle.com/">
              Octordle
            </a>{" "}
            by Kenneth Crawford
          </li>
          <li>
            <a rel="noreferrer" target="_blank" href="https://quordle.com/">
              Quordle
            </a>{" "}
            by @fireph
          </li>
          <li>
            <a rel="noreferrer" target="_blank" href="https://zaratustra.itch.io/dordle">
              Dordle
            </a>{" "}
            by Guilherme S. Töws
          </li>
          <li>
            <a rel="noreferrer" target="_blank" href="https://www.nytimes.com/games/wordle/index.html">
              Wordle
            </a>{" "}
            by Josh Wardle
          </li>
        </ul>
        <hr className="separator" />
        <div className="legal">
          <a target="_blank" href="privacy.html" rel="noreferrer">
            Privacy Policy
          </a>
        </div>
        <button className="close" onClick={() => dispatch(showPopup(undefined))}>
          close
        </button>
      </div>
    </div>
  );
}
