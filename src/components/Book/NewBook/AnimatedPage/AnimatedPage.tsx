import { animated, SpringValue, to } from "@react-spring/web";
import { ReactDOMAttributes } from "@use-gesture/react/dist/declarations/src/types";
import styles from "./AnimatedPage.module.css";
import { FlipDirection } from "../model";
import Helper from "../Helper";

interface IProps {
  pageNum: number;
  isRtl: boolean;
  isSinglePage: boolean;
  pages: JSX.Element[];
  x: SpringValue<number>;
  y: SpringValue<number>;
  progress: SpringValue<number>;
  direction: SpringValue<FlipDirection>;

  bind: (...args: unknown[]) => ReactDOMAttributes;
  i: number;
  pageWidth: number;
  bookRef: React.RefObject<HTMLDivElement>;
}

const AnimatedPage: React.FC<IProps> = ({
  pageNum,
  isRtl,
  isSinglePage,
  pages,
  bind,
  x,
  y,
  progress,
  direction,
  i,
  pageWidth,
  bookRef,
}) => {
  const isLeftPage = Helper.isLeftPage(pageNum, isRtl);
  const isHardPage = Helper.isHardPage(pageNum, pages.length);
  const backPageNum = Helper.getHiddenPageNum(
    pageNum,
    isSinglePage,
    isLeftPage,
    isRtl,
    true
  );
  const belowPageNum = Helper.getHiddenPageNum(
    pageNum,
    isSinglePage,
    isLeftPage,
    isRtl
  );
  const adjustOrigin = pageNum === pages.length - 1 || pageNum === 1;

  const getPageStyle = (isFront: boolean) => ({
    display: progress.to((p) =>
      (isFront ? p < 50 : p >= 50) ? "block" : "none"
    ),
    transformOrigin: Helper.getOrigin(
      isFront ? isLeftPage : adjustOrigin === isRtl,
      pageWidth
    ),
    clipPath: to([x, y], (x, y) =>
      getCorner(bookRef, x as number, y as number)
    ),
    // `polygon(50% 0%, 100% 38%, 100% 100%, 0 100%, 0 0)`,
    transform: getHardPageTransform(x, progress, direction, isRtl, isFront),
    zIndex: isFront ? 10 : progress.to((p) => (p > 50 ? 6 : 3)),
  });

  const getShadowStyle = (inner = false) => ({
    display: progress.to((p) => (p > 0 ? "block" : "none")),
    width: progress.to((p) => Helper.getShadowWidth(p, pageWidth)),
    background: progress.to((p: number) =>
      Helper.getShadowBackground(p, inner)
    ),
    transform: to([progress, direction], (p, dir) =>
      Helper.getShadowTransform(p as number, dir as FlipDirection, isRtl, inner)
    ),
  });

  return (
    <>
      <animated.div
        {...bind(i)}
        key={`page-front-${pageNum}`}
        className={`${styles.page} ${isLeftPage ? "" : styles.right} ${
          isSinglePage ? styles.onePage : ""
        }`}
        style={getPageStyle(true)}
      >
        {pages[pageNum]}
      </animated.div>

      <animated.div
        key={`page-back-${backPageNum}`}
        className={`${styles.page} ${
          adjustOrigin === isRtl ? "" : styles.right
        } ${isSinglePage ? styles.onePage : ""}`}
        style={getPageStyle(false)}
      >
        {pages[backPageNum]}
      </animated.div>

      {belowPageNum > 0 && belowPageNum < pages.length - 1 && (
        <animated.div
          className={`${styles.page} ${isLeftPage ? "" : styles.right} ${
            styles.below
          } ${isSinglePage ? styles.onePage : ""}`}
          // style={{ zIndex: 10 }}
        >
          {pages[belowPageNum]}
        </animated.div>
      )}

      {isHardPage && (
        <>
          {[false, true].map((isInner) => (
            <animated.div
              key={isInner ? "inner-shadow" : "outer-shadow"}
              className={`${styles.shadow} ${
                isSinglePage ? styles.onePage : ""
              }`}
              style={getShadowStyle(isInner)}
            />
          ))}
        </>
      )}
    </>
  );
};

export default AnimatedPage;

function getHardPageTransform(
  x: SpringValue<number>,
  progress: SpringValue<number>,
  direction: SpringValue<FlipDirection>,
  isRtl: boolean,
  isFront: boolean
) {
  return to(
    [x, progress, direction],
    (x, p, dir) =>
      `translate3d(0, 0, 0) rotateY(${Helper.getAngle(
        isRtl,
        p as number,
        dir as FlipDirection,
        !isFront
      )}deg)`
  );
}

function getCorner(
  bookRef: React.RefObject<HTMLDivElement>,
  clientX: number,
  clientY: number
) {
  const book = bookRef.current?.getBoundingClientRect();

  const bookTop = book?.top ?? 0;
  const bookWidth = book?.width ?? 0;
  const bookHeight = book?.height ?? 0;
  const bookLeft = book?.left ?? 0;

  const localX = clientX - bookLeft;
  const localY = clientY - bookTop;
  const corner = Helper.getHoverCorner(bookWidth, bookHeight, localX, localY);

  const poli = getClipPathForCorner(
    corner,
    bookWidth,
    bookHeight,
    localX,
    localY
  );

  return poli;
}
function getClipPathForCorner(
  corner: string | null,
  bookWidth: number,
  bookHeight: number,
  localX: number,
  localY: number
): string {
  // Adjust clipping dynamically based on localX and localY
  const xPercent = (localX / bookWidth) * 100;
  const yPercent = (localY / bookHeight) * 100;

  switch (corner) {
    case "top-left":
      return `polygon(${xPercent}% 0%, 100% 0, 100% 100%, 0 100%, 0 ${yPercent}%)`;
    case "top-right":
      return `polygon(0% 0%, ${xPercent}% ${yPercent}%, 100% 100%, 0 100%, 0 0)`;
    case "bottom-left":
      return `polygon(0 0, 100% 0, 100% 100%, ${xPercent}% 100%, 0 ${yPercent}%)`;
    case "bottom-right":
      return `polygon(0 0, 100% 0, 100% ${yPercent}%, ${xPercent}% 100%, 0 100%)`;
    default:
      return "";
  }
}
