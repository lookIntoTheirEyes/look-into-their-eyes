import { Handler, useGesture } from "@use-gesture/react";

import { useSprings } from "react-spring";
import { calculate } from "./calculate";

function getSideAndTurn(
  initial: number,
  xDir: number,
  offsetLeft: number,
  down: boolean,
  xMovement: number,
  pageWidth: number
) {
  let side: "left" | "right";
  const dir = xDir < 0 ? -1 : 1;

  if (initial - offsetLeft <= pageWidth) side = "left";
  else if (initial - offsetLeft > pageWidth) side = "right";
  else side = dir === -1 ? "right" : "left";

  const needFinishTurn =
    !down &&
    ((xMovement > 100 && side === "left") ||
      (xMovement < -100 && side === "right"));

  return { side, needFinishTurn };
}

export function useDrag({
  pageWidth,
  bookHeight,
  contentPages,
  bookWidth,
  offsetLeft,
  offsetTop,
}: {
  pageWidth: number;
  bookHeight: number;
  bookWidth: number;
  offsetTop: number;
  offsetLeft: number;
  contentPages: JSX.Element[];
}) {
  const from = (i: number) => ({
    x: pageWidth,
    y: 0,
    x1: 0,
    y1: 0,
    x2: pageWidth,
    y2: 0,
    x3: pageWidth,
    y3: bookHeight,
    x4: 0,
    y4: bookHeight,
    x5: 0,
    y5: bookHeight,
    z: i === 0 ? 2 : i >= 2 ? 0 : 1,
    display: i <= 2 ? "block" : "none",
    bgPos: 0,
    bgPosY: 0,
    bgRad: 0,
    bgHeight: bookHeight,
    bgDisplay: "none",
    bgY2: 0,
    r: 0,
    scaleX: 1,
    index: i,
  });

  const [props, set] = useSprings(contentPages.length, (i) => ({
    ...from(i),
    from: from(i),
  }));

  const onDragHandler: Handler<"drag"> = ({
    args: [index],
    down,
    distance,
    direction: [xDir],
    movement,
    initial,
    xy,
    memo,
  }) => {
    if (Object.values(distance).every((val) => !val)) return;

    let bgPos = 0;
    let bgRad = 0;
    let bgDisplay = "none";
    let bgPosY = 0;
    const bgY2 = 0;
    let bgHeight = bookHeight;
    const customConfig = {
      friction: 0,
      tension: down ? 0 : 100,
      clamp: true,
      precision: 0,
    };

    const to = {
      x: pageWidth,
      y: 0,
      x1: 0,
      y1: 0,
      x2: pageWidth,
      y2: 0,
      x3: pageWidth,
      y3: bookHeight,
      x4: 0,
      y4: bookHeight,
      x5: 0,
      y5: bookHeight,
      z: 1,
      bgPos: 0,
      bgPosY: 0,
      bgRad: 0,
      bgY2: 0,
      bgHeight: bookHeight,
      bgDisplay: "none",
      display: "none",
      config: customConfig,
      onRest: null,
      immediate: false,
      r: 0,
      scaleX: 1,
      index,
    };

    const { side, needFinishTurn } = getSideAndTurn(
      initial[0],
      xDir,
      offsetLeft,
      down,
      movement[0],
      pageWidth
    );
    const onFinishTurnFromRight = () => {
      set((i) => {
        if (i === index)
          return {
            ...to,
            z: 2,
            display: "none",
            x: 0,
            immediate: true,
          };
        if (i === index + 1)
          return {
            ...to,
            z: 1,
            x: 0,
            display: "block",
            immediate: true,
          };
        if (i === index + 2)
          return {
            ...to,
            z: 1,
            display: "block",
            immediate: true,
          };
        if (i === index - 1)
          return {
            ...to,
            x: 0,
            z: 0,
            display: "block",
            immediate: true,
          };

        if (i === index + 4) {
          return {
            ...to,
            x: pageWidth,
            z: 0,
            display: "block",
            immediate: true,
          };
        }
        return { ...to, z: 0, display: "none", immediate: true };
      });
    };

    const onFinishTurnFromLeft = () => {
      set((i) => {
        if (i === index)
          return {
            ...to,
            z: 2,
            x: pageWidth,
            immediate: true,
            display: "none",
          };
        if (i === index - 1)
          return {
            ...to,
            z: 1,
            x: pageWidth,
            display: "block",
            immediate: true,
          };
        if (i === index - 2)
          return {
            ...to,
            x: 0,
            z: 1,
            display: "block",
            immediate: true,
          };
        if (i === index + 1) {
          return {
            ...to,
            x: pageWidth,
            z: 0,
            display: "block",
            immediate: true,
          };
        }
        return { ...to, z: 0, display: "none", immediate: true };
      });
    };

    const onRestFnLeft = () => {
      if (!down && needFinishTurn) onFinishTurnFromLeft();
    };

    const onRestFnRight = () => {
      if (!down && needFinishTurn) {
        onFinishTurnFromRight();
      }
    };

    const rotationParams = calculate(
      side,
      xy[0],
      xy[1],
      initial,
      down,
      needFinishTurn,
      offsetLeft,
      offsetTop,
      bookWidth,
      bookHeight
    );

    const memoRotationParams = rotationParams;

    set((i) => {
      let x1 = 0;
      const y1 = 0;
      let x2 = 0;
      let y2 = 0;
      let x3 = 0;
      let y3 = 0;
      let x4 = 0;
      let y4 = 0;
      let x5 = 0;
      let y5 = 0;

      if (side === "left") {
        if (i === index - 1) {
          rotationParams.x5 = rotationParams.x4;
          rotationParams.y5 = rotationParams.y4;

          const result2 = {
            ...to,
            z: 2,
            ...rotationParams,
            bgPos: rotationParams.x1,
            scaleX: 1,
            onRest: () => {
              onRestFnLeft();
            },
          };

          if (!down && needFinishTurn) {
            let dist = memo.z0x;
            if (rotationParams.z0 === 1) dist = memo.z1x;

            if (rotationParams.z1 === 1 || rotationParams.z0 === 1) {
              return {
                r: 0,
                x: -pageWidth + dist * 2,
                y: 0,
                x1: pageWidth - dist,
                y1: 0,
                x2: pageWidth,
                y2: 0,
                x3: pageWidth,
                y3: bookHeight,
                x4: pageWidth - dist,
                y4: bookHeight,
                x5: pageWidth - dist,
                y5: bookHeight,
                immediate: true,
                onRest: () => {
                  set((i) => {
                    if (i === index) {
                      dist = pageWidth; // hack
                      return {
                        x1: dist,
                        y1: 0,
                        x2: pageWidth,
                        y2: 0,
                        x3: pageWidth,
                        y3: bookHeight,
                        x4: dist,
                        y4: bookHeight,
                        x5: dist,
                        y5: bookHeight,
                        immediate: true,
                        onRest: () => {
                          set((i) => {
                            if (i === index) {
                              return {
                                x: bookWidth,
                                display: "none",
                                immediate: false,
                                config: customConfig,
                                x1: pageWidth,
                                x2: pageWidth,
                                x3: pageWidth,
                                x4: pageWidth,
                                x5: pageWidth,
                              };
                            }
                            if (i === index - 1) {
                              const r = result2;
                              r.onRest = () => onFinishTurnFromLeft();
                              return r;
                            }
                          });
                        },
                      };
                    } else return;
                  });
                },
              };
            } else return result2;
          } else return result2;
        } else if (index === i) {
          if (rotationParams.z1 === 1) {
            x1 = rotationParams.z0x;
            x2 = pageWidth;
            x3 = pageWidth;
            y3 = bookHeight;
            y4 = bookHeight;
            x5 = rotationParams.z1x;
            y5 = rotationParams.z1y;

            if (!down && !needFinishTurn) {
              x1 = 0;
              x5 = 0;
              y5 = 0;
            }
          } else if (rotationParams.z0 === 1) {
            x2 = pageWidth;
            x3 = pageWidth;
            y3 = bookHeight;
            x4 = rotationParams.z1x;
            y4 = bookHeight;
            x5 = 0;
            y5 = rotationParams.z0y;
          } else {
            x1 = rotationParams.z0x;
            x2 = pageWidth;
            x3 = pageWidth;
            y3 = bookHeight;
            x4 = rotationParams.z1x;
            y4 = bookHeight;
            x5 = rotationParams.z1x;
            y5 = bookHeight;
          }

          const result = {
            ...to,
            display: "block",
            x: 0,
            x1,
            y1,
            x2,
            y2,
            x3,
            y3,
            x4,
            y4,
            x5,
            y5,
          };

          if (
            !down &&
            needFinishTurn &&
            (rotationParams.z1 === 1 || rotationParams.z0 === 1)
          ) {
            const dist = pageWidth; // hack
            return {
              r: 0,
              x: 0,
              y: 0,
              x1: dist,
              x4: dist,
              y1: 0,
              x2: pageWidth,
              y2: 0,
              x3: pageWidth,
              y3: bookHeight,
              y4: bookHeight,
              x5: dist,
              y5: bookHeight,
              immediate: true,
            };
          } else return result;
        } else if (i === index - 2) {
          return { ...to, x: 0, display: "block" };
        } else if (i === index + 1) {
          return { bgDisplay: "none" };
        } else return;
      } else if (side === "right") {
        if (index === i) {
          let setBg = false;
          if (rotationParams.z1 === 1) {
            x2 = rotationParams.z0x - pageWidth;
            x3 = rotationParams.z1x - pageWidth;
            y3 = rotationParams.z1y;
            x4 = pageWidth;
            y4 = bookHeight;
            x5 = 0;
            y5 = bookHeight;

            if (!down && !needFinishTurn) {
              x2 = pageWidth;
              y2 = 0;
              x3 = pageWidth;
              y3 = 0;
              x4 = pageWidth;
              y4 = bookHeight;
              x5 = 0;
              y5 = bookHeight;
            }

            const b = Math.abs(pageWidth - x2);
            const a = Math.abs(bookHeight - y3);
            bgRad = -((Math.atan(b / a) * 180) / Math.PI);
            bgHeight = Math.sqrt(a * a + b * b);
            bgPosY = bgHeight - bookHeight;
            setBg = true;
          } else if (rotationParams.z0 === 1) {
            x2 = pageWidth;
            y2 = 0;
            x3 = rotationParams.z0x - pageWidth;
            y3 = rotationParams.z0y;
            x4 = rotationParams.z1x - pageWidth;
            y4 = rotationParams.z1y;
            x5 = 0;
            y5 = bookHeight;

            if (!down && !needFinishTurn) {
              x3 = pageWidth;
              y3 = bookHeight;
              x4 = pageWidth;
              y4 = bookHeight;
              x5 = 0;
              y5 = bookHeight;
            }
          } else {
            x2 = rotationParams.z0x - pageWidth;
            x3 = rotationParams.z1x - pageWidth;
            y3 = rotationParams.z1y;
            y4 = bookHeight;
            x5 = x4;
            y5 = y4;

            if (!down && !needFinishTurn) {
              x2 = pageWidth;
              y2 = 0;
              x3 = pageWidth;
              y3 = bookHeight;
              x4 = 0;
              y4 = bookHeight;
              x5 = 0;
              y5 = bookHeight;
            }
          }

          if (!setBg) {
            const b = Math.abs(x2 - x3);
            const a = bookHeight;
            bgRad = -90 + (Math.atan(a / b) * 180) / Math.PI;
            bgHeight = Math.sqrt(a * a + b * b);
            bgPosY = bgHeight - bookHeight;
          }

          const result = {
            ...to,
            display: "block",
            x: pageWidth,
            x2,
            y2,
            x3,
            y3,
            x4,
            y4,
            x5,
            y5,
          };

          if (
            !down &&
            needFinishTurn &&
            (rotationParams.z1 === 1 || rotationParams.z0 === 1)
          ) {
            return {
              r: 0,
              x: pageWidth,
              y: 0,
              x1: 0,
              y1: 0,
              x2: pageWidth - memo.x2,
              y2: 0,
              x3: pageWidth - memo.x2,
              y3: bookHeight,
              x4: 0,
              y4: bookHeight,
              x5: 0,
              y5: bookHeight,
              immediate: true,
            };
          } else return result;
        } else if (i === index + 1) {
          if (rotationParams.x3 > rotationParams.x2) bgRad = -bgRad;
          bgPos = pageWidth - rotationParams.x2;
          bgDisplay = "block";

          const result = {
            ...to,
            z: 1,
            ...rotationParams,
            onRest: () => onRestFnRight(),
          };

          if (!down && needFinishTurn) {
            if (rotationParams.z1 === 1 || rotationParams.z0 === 1) {
              return {
                r: 0,
                x: bookWidth - memo.x2 * 2,
                y: 0,
                x1: 0,
                y1: 0,
                x2: memo.x2,
                y2: 0,
                x3: memo.x2,
                y3: bookHeight,
                x4: 0,
                y4: bookHeight,
                x5: 0,
                y5: bookHeight,
                immediate: true,
                onRest: () => {
                  set((i) => {
                    if (i === index) {
                      return {
                        x2: pageWidth - memo.x2,
                        x3: pageWidth - memo.x2,
                        immediate: true,
                        onRest: () => {
                          set((i) => {
                            if (i === index) {
                              return {
                                immediate: false,
                                config: customConfig,
                                x2: 0,
                                x3: 0,
                              };
                            }
                          });
                        },
                      };
                    }
                    if (i === index + 1) {
                      return result;
                    }
                  });
                },
              };
            } else return result;
          } else return result;
        } else if (i === index + 2) {
          return {
            index,
            bgPos,
            bgPosY,
            bgRad,
            bgHeight,
            bgDisplay,
            bgY2,
            display: "block",
            immediate: true,
            x: pageWidth,
          };
        }
      } else return { index, onRest: null, display: "none", immediate: true };
    });

    if (down) {
      return memoRotationParams;
    }
  };

  const bind = useGesture(
    {
      onDrag: onDragHandler,
    },
    {}
  );
  return { bind, props };
}
