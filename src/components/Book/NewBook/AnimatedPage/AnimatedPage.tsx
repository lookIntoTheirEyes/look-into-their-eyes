import { animated, SpringValue, to } from "@react-spring/web";
import { ReactDOMAttributes } from "@use-gesture/react/dist/declarations/src/types";
import styles from "./AnimatedPage.module.css";

interface IProps {
  pageNum: number;
  isRtl: boolean;
  isFirst: boolean;
  isLast: boolean;
  isSinglePage: boolean;
  pages: JSX.Element[];
  x: SpringValue<number>;
  y: SpringValue<number>;
  r: SpringValue<number>;
  z: SpringValue<number>;
  displayFront: SpringValue<string>;
  displayBack: SpringValue<string>;
  bind: (...args: unknown[]) => ReactDOMAttributes;
  i: number;
  pageWidth: number;
}

const AnimatedPage: React.FC<IProps> = ({
  pageNum,
  isRtl,
  i,
  isFirst,
  isLast,
  z,
  isSinglePage,
  pages,
  bind,
  x,
  y,
  r,
  displayFront,
  displayBack,
  pageWidth,
}) => {
  const isLeftPage = getIsLeftPage(pageNum, isRtl);

  const backPageNum = getHiddenPageNum(
    pageNum,
    isSinglePage,
    isLeftPage,
    isRtl,
    true
  );

  const belowPageNum = getHiddenPageNum(
    pageNum,
    isSinglePage,
    isLeftPage,
    isRtl
  );

  return (
    <>
      <animated.div
        key={`Page-${pageNum}`}
        className={`${styles.pageContainer} ${
          getIsLeftPage(pageNum, isRtl) ? "" : styles.right
        }`}
        style={{ x, y, zIndex: z.to((z) => `${z}`) }}
      >
        <animated.div
          key={`Page-inner-${pageNum}`}
          {...bind(i)}
          className={`${styles.page} `}
          style={{
            height: "100%",
            display: displayFront,
            transform: r.to((r) => `rotateY(${r}deg)`),
            // transformOrigin: i % 2 === 0 ? pageWidth + "px 0px" : "0px 0px",
            // transform: to([x, y, r], (x, y, r) => {
            //   console.log(x, y, r);

            //   return `translateX(${x}px) translateY(${y}px) rotate(${r}rad) scaleX(${1})`;
            // }),
          }}
        >
          {pages[pageNum]}
        </animated.div>

        <animated.div
          className={`${styles.page} ${styles.back}`}
          style={{
            height: "100%",
            display: displayBack,
            transform: r.to((r) => `rotateY(${180 - r}deg)`),
          }}
        >
          {pages[backPageNum]}
        </animated.div>
      </animated.div>
      {belowPageNum > 0 && belowPageNum < pages.length - 1 && (
        <div
          className={`${styles.page} ${isLeftPage ? "" : styles.right} ${
            styles.below
          } ${isSinglePage ? styles.onePage : ""}`}
        >
          {pages[belowPageNum]}
        </div>
      )}
    </>
  );
};

export default AnimatedPage;

function getIsLeftPage(pageNum: number, isRtl: boolean) {
  if (isRtl) {
    return pageNum % 2 === 0;
  }
  return pageNum % 2 === 1;
}

function getHiddenPageNum(
  pageNum: number,
  isSinglePage: boolean,
  isLeftPage: boolean,
  isRtl: boolean,
  isBack = false
) {
  const factor = isBack ? 1 : 2;
  if (!isRtl) {
    return isSinglePage || isLeftPage ? pageNum - factor : pageNum + factor;
  }
  return isSinglePage || isLeftPage ? pageNum + factor : pageNum - factor;
}
