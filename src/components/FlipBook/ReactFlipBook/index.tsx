import React, {
  ReactElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { IFlipSetting, IEventProps } from "./settings";
import { PageFlip } from "../PageFlip";

import styles from "./index.module.css";

interface IProps extends IFlipSetting, IEventProps {
  children: React.ReactNode;
  controls: React.ReactNode;
  blankPage?: React.ReactElement;
}

interface FlipPageElement extends ReactElement {
  ref?: React.Ref<HTMLElement>;
}

const HTMLFlipBookForward = React.forwardRef<
  { pageFlip: () => PageFlip | null },
  IProps
>((props, ref) => {
  const htmlElementRef = useRef<HTMLDivElement | null>(null);
  const childRef = useRef<HTMLElement[]>([]);
  const blankPageRef = useRef<HTMLElement | null>(null);
  const pageFlip = useRef<PageFlip | null>(null);
  const [pages, setPages] = useState<FlipPageElement[]>([]);
  const [isLoading, setLoading] = useState(true);
  const isInitialized = useRef(false);

  useImperativeHandle(ref, () => ({
    pageFlip: () => pageFlip.current,
  }));

  const removeHandlers = useCallback(() => {
    const flip = pageFlip.current;
    if (flip) {
      flip.removeListeners();
    }
  }, []);

  useEffect(() => {
    childRef.current = [];

    if (!props.children) return;

    const childList = React.Children.map(props.children, (child) => {
      if (!React.isValidElement(child)) return child;
      return React.cloneElement(child, {
        ref: (dom: HTMLElement | null) => {
          if (dom) childRef.current.push(dom);
        },
      } as { ref: (dom: HTMLElement | null) => void });
    });

    setPages(childList as FlipPageElement[]);
  }, [props.children]);

  useEffect(() => {
    const setHandlers = () => {
      const flip = pageFlip.current;
      if (flip) {
        if (props.onFlip) flip.on("flip", props.onFlip);
        if (props.onChangeOrientation)
          flip.on("changeOrientation", props.onChangeOrientation);
        if (props.onInit) flip.on("init", props.onInit);
      }
    };

    if (
      pages.length > 0 &&
      childRef.current.length > 0 &&
      !isInitialized.current
    ) {
      if (htmlElementRef.current && !pageFlip.current) {
        pageFlip.current = new PageFlip(htmlElementRef.current, props);
      }

      if (!pageFlip.current?.getFlipController()) {
        pageFlip.current?.loadFromHTML(childRef.current);
        isInitialized.current = true;
        setLoading(false);
      }
    }

    if (
      pageFlip.current?.hasListeners() === false &&
      (props.onFlip || props.onChangeOrientation || props.onInit)
    ) {
      setHandlers();
    }

    return () => removeHandlers();
  }, [pages.length, removeHandlers, props]);

  return (
    <>
      {props.blankPage && (
        <div style={{ display: "none" }}>
          {React.cloneElement(props.blankPage, {
            ref: (dom: HTMLElement | null) => {
              if (dom) blankPageRef.current = dom;
            },
          })}
        </div>
      )}
      {isLoading && <div className={styles.loader} />}
      <div
        ref={htmlElementRef}
        style={{ display: !isLoading ? "block" : "none" }}
      >
        {pages}
      </div>
      {!isLoading && props.controls}
    </>
  );
});

HTMLFlipBookForward.displayName = "HTMLFlipBookForward";

export default React.memo(HTMLFlipBookForward);
