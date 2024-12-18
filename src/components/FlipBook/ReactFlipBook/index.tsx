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
import { WidgetEvent } from "../Event/EventObject";

import styles from "./index.module.css";

interface IProps extends IFlipSetting, IEventProps {
  children: React.ReactNode;
  controls: React.ReactNode;
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
    if (pages.length === childRef.current.length && pages.length > 0) {
      return;
    }
    childRef.current = [];

    if (props.children) {
      const childList = React.Children.map(props.children, (child) => {
        if (!React.isValidElement(child)) {
          return child;
        }

        return React.cloneElement(child, {
          ref: (dom: HTMLElement | null) => {
            if (dom) {
              childRef.current.push(dom);
            }
          },
        } as { ref: (dom: HTMLElement | null) => void });
      });

      setPages((childList || []) as FlipPageElement[]);
    }
  }, [props.children, props.rtl]);

  useEffect(() => {
    const setHandlers = () => {
      const flip = pageFlip.current;
      if (flip) {
        if (props.onFlip) {
          flip.on("flip", (e: WidgetEvent) => {
            props.onFlip?.(e);
          });
        }
        if (props.onChangeOrientation) {
          flip.on("changeOrientation", (e: WidgetEvent) => {
            props.onChangeOrientation?.(e);
          });
        }
        if (props.onInit) {
          flip.on("init", (e: WidgetEvent) => {
            props.onInit?.(e);
          });
        }
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
      } else {
        pageFlip.current.updateFromHtml(childRef.current);
      }
    }

    if (
      pageFlip.current?.hasListeners() === false &&
      (props.onFlip || props.onChangeOrientation || props.onInit)
    ) {
      setHandlers();
    }

    return () => {
      removeHandlers();
    };
  }, [pages.length, removeHandlers, props]);

  return (
    <>
      {isLoading && <div className={styles.loader} />}
      <div
        style={{ display: !isLoading ? "block" : "none" }}
        ref={htmlElementRef}
      >
        {pages}
      </div>
      {!isLoading && props.controls}
    </>
  );
});

HTMLFlipBookForward.displayName = "HTMLFlipBookForward";

export default React.memo(HTMLFlipBookForward);
