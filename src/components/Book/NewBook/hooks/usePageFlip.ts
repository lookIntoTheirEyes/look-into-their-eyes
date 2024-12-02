import { RefObject, useCallback } from "react";
import { useSprings } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import FlipCalculation from "../FlipCalculation";

interface UsePageFlipParams {
  pageWidth: number;
  isRtl: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
  bookRef: RefObject<HTMLDivElement>;
}

export const usePageFlip = ({
  pageWidth,
  isRtl,
  onNextPage,
  onPrevPage,
  bookRef,
}: UsePageFlipParams) => {
  const from = useCallback(
    (i?: number) => ({
      x: 0,
      y: 0,
      r: 0,
      z: 10,
      displayFront: "block",
      displayBack: "none",
      immediate: false,
    }),
    []
  );

  const [props, api] = useSprings(2, (i) => ({
    ...from(i),
    from: from(i),
  }));

  const bind = useGesture(
    {
      onDragEnd: (params) => {
        const {
          args: [idx],
          movement: [mx, my],
          velocity: [vx],
          initial,
        } = params;

        api.start((i) => {
          if (idx !== i) {
            return { onRest: () => ({ ...from(), z: 9 }) };
          }
          const progress = FlipCalculation.getFlippingProgress(mx, pageWidth);

          const rotation =
            progress <= 50
              ? (progress / 50) * 90
              : 90 + ((progress - 50) / 50) * 90;

          const isShowingBack = progress > 50;

          return {
            ...from(),
            x: pageWidth,

            onRest: () => {
              console.log("rest", i);

              // if (FlipCalculation.getFlippingProgress(mx, pageWidth) > 50) {
              onNextPage();
              return from();
              // }
            },
          };
        });
        // onPrevPage();
      },
      onDrag: (params) => {
        const {
          movement: [mx, my],
          down,
          args: [idx],
        } = params;

        const progress = FlipCalculation.getFlippingProgress(mx, pageWidth);

        const rotation =
          progress <= 50
            ? (progress / 50) * 90
            : 90 + ((progress - 50) / 50) * 90;

        const isShowingBack = progress > 50;

        api.start((i) => {
          if (idx !== i) {
            return;
          }

          return {
            x: mx,
            y: my,
            r: isRtl ? -rotation : rotation,
            displayFront: isShowingBack ? "none" : "block",
            displayBack: isShowingBack ? "block" : "none",
            immediate: down,
            z: 10,
          };
        });
      },
    },
    { drag: { filterTaps: true, bounds: bookRef } }
  );

  return { props, bind, api };
};
