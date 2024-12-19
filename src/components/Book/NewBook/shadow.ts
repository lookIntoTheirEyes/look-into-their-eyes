import { Interpolation, SpringValue, to } from "@react-spring/web";
import { FlipDirection, PageRect, Point } from "./model";
import FlipCalculation, { ICalc } from "./FlipCalculation";
import Helper from "./Helper";

const MIN_SHADOW_PROGRESS = 0.5;

function getSoftShadowStyle(
  direction: SpringValue<FlipDirection>,
  isRtl: boolean,
  inner: boolean,
  calc: Interpolation<ICalc | null>,
  rect: PageRect
) {
  return inner
    ? getSoftInnerShadow(direction, isRtl, calc, rect)
    : getSoftOuterShadow({ direction, calc, rect, isRtl });
}

function createShadowBaseStyles(rect: PageRect) {
  return {
    height: `${rect.height * 2}px`,
  };
}

function calculateShadowTranslate(
  direction: FlipDirection,
  shadowWidth: number,
  isInner: boolean,
  isRtl: boolean
) {
  if (isInner) {
    const innerShadowSize = (shadowWidth * 3) / 4;
    return (direction === FlipDirection.FORWARD) !== isRtl
      ? innerShadowSize
      : 0;
  }
  return (direction === FlipDirection.BACK) !== isRtl ? shadowWidth : 0;
}

function createShadowTransform(
  shadowPos: Point | null,
  shadowTranslate: number,
  angle: number
) {
  if (!shadowPos) {
    return "none";
  }
  return `translate3d(${shadowPos.x - shadowTranslate}px, ${
    shadowPos.y - 100
  }px, 0) rotate(${angle}rad)`;
}

function getSoftInnerShadow(
  direction: SpringValue<FlipDirection>,
  isRtl: boolean,
  calc: Interpolation<ICalc | null>,
  rect: PageRect
) {
  return {
    ...createShadowBaseStyles(rect),
    width: calc.to((calc) =>
      calc ? `${(calc.shadow.width * 3) / 4}px` : "0px"
    ),
    transformOrigin: to([direction, calc], (direction, calc) => {
      if (!calc) return "0px 0px";
      const shadowTranslate = calculateShadowTranslate(
        direction,
        calc.shadow.width,
        true,
        isRtl
      );
      return `${shadowTranslate}px 100px`;
    }),
    background: to([direction, calc], (direction, calc) => {
      if (!calc) return "none";
      const shadow = calc.shadow;
      const gradientDirection =
        (direction === FlipDirection.FORWARD) !== isRtl
          ? "to left"
          : "to right";

      return `linear-gradient(${gradientDirection},
          rgba(0, 0, 0, ${shadow.opacity}) 5%,
          rgba(0, 0, 0, 0.05) 15%,
          rgba(0, 0, 0, ${shadow.opacity}) 35%,
          rgba(0, 0, 0, 0) 100%
        )`;
    }),
    transform: to([direction, calc], (direction, calc) => {
      if (!calc) return "none";
      const { shadow } = calc;
      const shadowTranslate = calculateShadowTranslate(
        direction,
        shadow.width,
        true,
        isRtl
      );
      const shadowPos = FlipCalculation.convertToGlobal(
        shadow.pos,
        direction,
        rect.width,
        isRtl
      );
      const angle = shadow.angle + (3 * Math.PI) / 2;

      return createShadowTransform(shadowPos, shadowTranslate, angle);
    }),
    clipPath: to([direction, calc], (direction, calc) => {
      if (!calc) return "none";
      const { shadow, rect: rectPoints } = calc;
      const clip = [
        rectPoints.topLeft,
        rectPoints.topRight,
        rectPoints.bottomRight,
        rectPoints.bottomLeft,
      ];
      const shadowTranslate = calculateShadowTranslate(
        direction,
        shadow.width,
        true,
        isRtl
      );
      const angle = shadow.angle + (3 * Math.PI) / 2;

      return createClipPath(
        clip,
        direction,
        shadow.pos,
        shadowTranslate,
        angle,
        isRtl
      );
    }),
    display: calc.to((calc) =>
      calc?.shadow.progress > MIN_SHADOW_PROGRESS ? "block" : "none"
    ),
  };
}

function getSoftOuterShadow({
  rect,
  calc,
  direction,
  isRtl,
}: {
  rect: PageRect;
  calc: Interpolation<ICalc | null>;
  direction: SpringValue<FlipDirection>;
  isRtl: boolean;
}) {
  const staticClip = [
    { x: 0, y: 0 },
    { x: rect.pageWidth, y: 0 },
    { x: rect.pageWidth, y: rect.height },
    { x: 0, y: rect.height },
  ];

  return {
    ...createShadowBaseStyles(rect),
    width: calc.to((calc) => (calc ? `${calc.shadow.width}px` : "0px")),
    background: to([direction, calc], (direction, calc) => {
      if (!calc) return "none";
      const { shadow } = calc;
      const gradientDirection =
        (direction === FlipDirection.FORWARD) !== isRtl
          ? "to right"
          : "to left";
      return `linear-gradient(${gradientDirection}, rgba(0, 0, 0, ${shadow.opacity}), rgba(0, 0, 0, 0))`;
    }),
    transformOrigin: to([calc, direction], (calc, direction) => {
      if (!calc) return "0px 0px";
      const shadowTranslate = calculateShadowTranslate(
        direction,
        calc.shadow.width,
        false,
        isRtl
      );
      return `${shadowTranslate}px 100px`;
    }),
    transform: to([calc, direction], (calc, direction) => {
      if (!calc) return "none";

      const { shadow } = calc;
      const shadowTranslate = calculateShadowTranslate(
        direction,
        shadow.width,
        false,
        isRtl
      );
      const shadowPos = FlipCalculation.convertToGlobal(
        shadow.pos,
        direction,
        rect.width,
        isRtl
      );
      const angle = shadow.angle + (3 * Math.PI) / 2;

      return createShadowTransform(shadowPos, shadowTranslate, angle);
    }),
    clipPath: to([direction, calc], (direction, calc) => {
      if (!calc) return "none";
      const { shadow } = calc;
      const shadowTranslate = calculateShadowTranslate(
        direction,
        shadow.width,
        false,
        isRtl
      );
      const angle = shadow.angle + (3 * Math.PI) / 2;

      return createClipPath(
        staticClip,
        direction,
        shadow.pos,
        shadowTranslate,
        angle,
        isRtl
      );
    }),
    display: calc.to((calc) =>
      calc?.shadow.progress > MIN_SHADOW_PROGRESS ? "block" : "none"
    ),
  };
}

function createClipPath(
  points: Point[],
  direction: FlipDirection,
  shadowPos: Point,
  shadowTranslate: number,
  angle: number,
  isRtl: boolean
): string {
  const polygon = points.reduce((acc, p) => {
    if (!p) return acc;

    const g = {
      x:
        (direction === FlipDirection.BACK) !== isRtl
          ? -p.x + shadowPos.x
          : p.x - shadowPos.x,
      y: p.y - shadowPos.y,
    };

    const rotated = Helper.GetRotatedPoint(
      g,
      { x: shadowTranslate, y: 100 },
      angle
    );

    return `${acc}${rotated.x}px ${rotated.y}px, `;
  }, "polygon(");

  return polygon.slice(0, -2) + ")";
}

function getHardShadowStyle(
  progress: SpringValue<number>,
  direction: SpringValue<FlipDirection>,
  pageWidth: number,
  isRtl: boolean,
  inner = false
) {
  return {
    display: progress.to((p) => (p > MIN_SHADOW_PROGRESS ? "block" : "none")),
    width: progress.to((p) => Helper.getShadowWidth(p, pageWidth)),
    background: progress.to((p) => Helper.getShadowBackground(p, inner)),
    transform: to([progress, direction], (p, dir) =>
      Helper.getShadowTransform(p as number, dir as FlipDirection, isRtl, inner)
    ),
  };
}

const ShadowStyle = {
  getSoftShadowStyle,
  getHardShadowStyle,
};

export default ShadowStyle;
