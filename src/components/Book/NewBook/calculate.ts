type Side = "left" | "right";

interface Result {
  x: number;
  y: number;
  r: number;
  display: string;
  z0x: number;
  z0y: number;
  z1x: number;
  z1y: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  x4: number;
  y4: number;
  x5: number;
  y5: number;
  z0: number;
  z1: number;
}

function reflect({
  x,
  y,
  A,
  B,
  C,
  calcFor,
}: {
  x: number;
  y: number;
  A: number;
  B: number;
  C: number;
  calcFor: "x" | "y";
}) {
  const isY = calcFor === "y";
  return (
    ((isY ? A * A - B * B : B * B - A * A) * (isY ? y : x) -
      2 * A * B * (isY ? x : y) -
      2 * (isY ? B : A) * C) /
    (A * A + B * B)
  );
}

function getStart(coord: number, limit: number, side?: Side): number {
  if (side === "right" || coord > limit) return limit;
  if (side === "left" || coord < 0) {
    return 0;
  }
  return coord;
}

const getPosition = (
  side: Side,
  clientX: number,
  clientY: number,
  initial: [number, number],
  offsetLeft: number,
  offsetTop: number,
  bookWidth: number,
  bookHeight: number
) => {
  const movementStartX = initial[0] - offsetLeft;
  const movementStartY = initial[1] - offsetTop;

  const startX = getStart(movementStartX, bookWidth, side);
  const startY = getStart(movementStartY, bookHeight);

  const cursorX = Math.max(0, Math.min(clientX - offsetLeft, bookWidth));
  const cursorY = Math.max(0, Math.min(clientY - offsetTop, bookHeight));

  const slope = (cursorX - startX) / (startY - cursorY);

  return { cursorX, cursorY, slope, startX, startY };
};

function getZXY({
  cursorX,
  cursorY,
  slope,
  startX,
  startY,
  side,
  pageWidth,
  bookWidth,
  bookHeight,
}: {
  cursorX: number;
  cursorY: number;
  slope: number;
  startX: number;
  startY: number;
  side: Side;
  pageWidth: number;
  bookWidth: number;
  bookHeight: number;
}) {
  const mx = (cursorX + startX) / 2;
  const my = (cursorY + startY) / 2;
  let z0x = -my / slope + mx;
  let z0y = 0;
  let z0 = 0;

  if (side === "right") {
    if (z0x > bookWidth) {
      z0x = bookWidth;
      z0y = slope * (bookWidth - mx) + my;
      z0 = 1;
    }

    if (z0x < pageWidth) {
      z0x = pageWidth;
    }
  } else {
    if (z0x < 0) {
      z0x = 0;
      z0y = -slope * mx + my;
      z0 = 1;
    }

    if (z0x > pageWidth) {
      z0x = pageWidth;
    }
  }

  let z1x = (bookHeight - my) / slope + mx;
  let z1y = bookHeight;
  let z1 = 0;

  if (side === "right") {
    if (z1x > bookWidth) {
      z1x = bookWidth;
      z1y = slope * (bookWidth - mx) + my;
      z1 = 1;
    }
    if (z1x < pageWidth) {
      z1x = pageWidth;
    }
  } else if (side === "left") {
    if (z1x < 0) {
      z1x = 0;
      z1y = -slope * mx + my;
      z1 = 1;
    }
    if (z1x > pageWidth) {
      z1x = pageWidth;
    }
  }

  return { z0x, z0y, z0, z1x, z1y, z1 };
}

function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// A helper function to calculate the result state based on z0, z1, and other factors

export function calculate(
  side: Side,
  clientX: number,
  clientY: number,
  initial: [number, number],
  down: boolean,
  needFinishTurn: boolean,
  offsetLeft: number,
  offsetTop: number,
  bookWidth: number,
  bookHeight: number
): Result {
  const result = {} as Result;
  const pageWidth = bookWidth / 2;

  const { cursorX, cursorY, slope, startX, startY } = getPosition(
    side,
    clientX,
    clientY,
    initial,
    offsetLeft,
    offsetTop,
    bookWidth,
    bookHeight
  );

  const { z0x, z0y, z1x, z1y, z0, z1 } = getZXY({
    cursorX,
    cursorY,
    slope,
    startX,
    startY,
    side,
    pageWidth,
    bookHeight,
    bookWidth,
  });

  const A = z1y - z0y;
  const B = z0x - z1x;
  const C = -(A * z0x + B * z0y);

  const x = side === "right" ? bookWidth : 0;

  const u0x = reflect({ x, y: 0, A, B, C, calcFor: "x" });
  const u0y = reflect({ x, y: 0, A, B, C, calcFor: "y" });
  const u1x = reflect({ x, y: bookHeight, A, B, C, calcFor: "x" });
  const u1y = reflect({ x, y: bookHeight, A, B, C, calcFor: "y" });

  result.z0x = z0x;
  result.z0y = z0y;
  result.z1x = z1x;
  result.z1y = z1y;

  const angle = Math.atan2(u1y - u0y, u1x - u0x) - Math.PI / 2;

  const d1 = dist(z0x, z0y, u0x, u0y);
  const d2 = dist(z1x, z1y, u1x, u1y);

  result.x = side === "right" ? u0x : u0x - pageWidth;
  result.y = u0y;

  result.r = angle;
  result.display = "block";

  result.z0 = z0;
  result.z1 = z1;

  if (z0 === 0 && z1 === 0) {
    if (side === "right") {
      result.x1 = 0;
      result.y1 = 0;
      result.x2 = d1;
      result.y2 = 0;
      result.x3 = d2;
      result.y3 = bookHeight;
      result.x4 = 0;
      result.y4 = bookHeight;
    } else {
      result.x1 = pageWidth - d1;
      result.y1 = 0;
      result.x2 = pageWidth;
      result.y2 = 0;
      result.x3 = pageWidth;
      result.y3 = bookHeight;
      result.x4 = pageWidth - d2;
      result.y4 = bookHeight;
    }
  } else if (z0 === 1) {
    if (side === "right") {
      result.x1 = 0;
      result.y1 = d1;
      result.x2 = d2;
      result.y2 = bookHeight;
      result.x3 = 0;
      result.y3 = bookHeight;
      result.x4 = result.x3;
      result.y4 = result.y3;
    } else {
      result.x1 = pageWidth;
      result.y1 = d1;
      result.x2 = pageWidth - d2;
      result.y2 = bookHeight;
      result.x3 = pageWidth;
      result.y3 = bookHeight;
      result.x4 = result.x3;
      result.y4 = result.y3;
    }
  } else if (z1 === 1) {
    if (side === "right") {
      result.x1 = 0;
      result.y1 = 0;
      result.x2 = d1;
      result.y2 = 0;
      result.x3 = 0;
      result.y3 = bookHeight - d2;
      result.x4 = result.x3;
      result.y4 = result.x3;
    } else {
      result.x1 = pageWidth;
      result.y1 = 0;
      result.x2 = pageWidth - d1;
      result.y2 = 0;
      result.x3 = pageWidth;
      result.y3 = bookHeight - d2;
      result.x4 = result.x3;
      result.y4 = result.x3;
    }
  }

  if (!down) {
    if (needFinishTurn) {
      if (side === "right") {
        result.x = 0;
        result.x1 = 0;
        result.x2 = pageWidth;
        result.x3 = pageWidth;
        result.x4 = 0;
        result.y = 0;
        result.y1 = 0;
        result.y2 = 0;
        result.y3 = bookHeight;
        result.y4 = bookHeight;
        result.r = 0;
        result.z0x = pageWidth;
        result.z0y = 0;
        result.z1x = pageWidth;
        result.z1y = bookHeight;
      } else {
        result.x = pageWidth;
        result.x1 = 0;
        result.x2 = pageWidth;
        result.x3 = pageWidth;
        result.x4 = 0;
        result.y = 0;
        result.y1 = 0;
        result.y2 = 0;
        result.y3 = bookHeight;
        result.y4 = bookHeight;
        result.r = 0;
        result.z0x = pageWidth;
        result.z0y = 0;
        result.z1x = pageWidth;
        result.z1y = bookHeight;
      }
    } else {
      // back
      if (side === "right") {
        if (z1 === 1) {
          // top corner
          result.y = 0;
          result.x = bookWidth;
          result.x2 = 0;
          result.x3 = 0;
          result.x4 = 0;
          result.y1 = 0;
          result.y2 = 0;
          result.y3 = 0;
          result.z0x = 0;
          result.z0y = 0;
          result.z1x = 0;
          result.z1y = 0;
        } else if (z0 === 1) {
          result.x = bookWidth + u0x - u1x;
          result.y = bookHeight + u0y - u1y;
          result.x1 = 0;
          result.y1 = bookHeight;
          result.x2 = 0;
          result.y2 = bookHeight;
          result.x3 = result.x2;
          result.x4 = result.x2;
          result.y3 = result.y2;
          result.y4 = result.y2;
          result.z0x = 0;
          result.z0y = 0;
          result.z1x = 0;
          result.z1y = 0;
        } else {
          result.r = 0;
          result.y = 0;
          result.x = bookWidth;
          result.x1 = 0;
          result.x2 = 0;
          result.x3 = 0;
          result.x4 = 0;
          result.y1 = 0;
          result.y2 = 0;
          result.y3 = bookHeight;
          result.y4 = bookHeight;
          result.z0x = 0;
          result.z0y = 0;
          result.z1x = 0;
          result.z1y = 0;
        }
      } else {
        if (z1 === 1) {
          // top corner
          result.x = -pageWidth;
          result.y = 0;

          result.x1 = pageWidth;
          result.x2 = pageWidth;
          result.x3 = pageWidth;
          result.x4 = pageWidth;
          result.x5 = pageWidth;

          result.y1 = 0;
          result.y2 = 0;
          result.y3 = 0;
          result.y4 = 0;
          result.y5 = 0;

          result.z0x = 0;
          result.z0y = 0;
          result.z1x = 0;
          result.z1y = 0;
        } else if (z0 === 1) {
          // bottom corner
          result.x = -pageWidth;
          result.x1 = pageWidth;
          result.x2 = pageWidth;
          result.x3 = pageWidth;
          result.x4 = pageWidth;
          result.x5 = pageWidth;

          result.y = bookHeight;
          result.y1 = 0;
          result.y2 = 0;
          result.y3 = 0;
          result.y4 = 0;
          result.y5 = 0;

          result.z0x = 0;
          result.z0y = bookHeight;
          result.z1x = 0;
          result.z1y = bookHeight;
        } else {
          result.r = 0;
          result.y = 0;
          result.x = -pageWidth;
          result.x1 = pageWidth;
          result.x2 = pageWidth;
          result.x3 = pageWidth;
          result.x4 = pageWidth;
          result.y1 = 0;
          result.y2 = 0;
          result.y3 = bookHeight;
          result.y4 = bookHeight;

          result.z0x = 0;
          result.z0y = 0;
          result.z1x = 0;
          result.z1y = bookHeight;
        }
      }
    }
  }

  return result;
}
