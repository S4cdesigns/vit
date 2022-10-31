import { EffectCallback, useEffect, useRef } from "react";

/**
 * A custom useEffect hook that only triggers on updates, not on initial mount
 */
export default function useUpdateEffect<T>(effect: EffectCallback, dependencies: T[] = []) {
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      return effect();
    }
  }, dependencies);
}
