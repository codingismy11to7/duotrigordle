import { TypedUseSelectorHook, useDispatch, useSelector as useSelectorOriginal } from "react-redux";
import { AppDispatch, RootState } from "./index";

export const useAppDispatch = (): AppDispatch => useDispatch();
// Partially monomorphise useSelector with State
export const useSelector: TypedUseSelectorHook<RootState> = useSelectorOriginal;
