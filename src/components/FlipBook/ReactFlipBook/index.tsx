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

interface IProps extends IFlipSetting, IEventProps {
  children: React.ReactNode;
}

// Define a type for the child components that can accept refs
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

  useImperativeHandle(ref, () => ({
    pageFlip: () => pageFlip.current,
  }));

  const refreshOnPageDelete = useCallback(() => {
    if (pageFlip.current) {
      pageFlip.current.clear();
    }
  }, []);

  const removeHandlers = useCallback(() => {
    const flip = pageFlip.current;
    if (flip) {
      flip.off("flip");
      flip.off("changeOrientation");
      flip.off("init");
    }
  }, []);

  useEffect(() => {
    if (pages.length === childRef.current.length && pages.length > 0) {
      return;
    }
    childRef.current = [];

    if (props.children) {
      const childList = React.Children.map(props.children, (child) => {
        // Type guard to ensure child is a ReactElement
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
  }, [pages.length, props.children, props.rtl, refreshOnPageDelete]);

  useEffect(() => {
    const setHandlers = () => {
      const flip = pageFlip.current;

      if (flip) {
        if (props.onFlip) {
          flip.on("flip", (e: WidgetEvent) => props.onFlip?.(e));
        }

        if (props.onChangeOrientation) {
          flip.on("changeOrientation", (e: WidgetEvent) => {
            props.onChangeOrientation?.(e);
          });
        }

        if (props.onInit) {
          if (flip.hasEvent("init")) {
            removeHandlers();
          }

          flip.on("init", (e: WidgetEvent) => {
            props.onInit?.(e);
          });
        }
      }
    };

    if (pages.length > 0 && childRef.current.length > 0) {
      removeHandlers();

      if (htmlElementRef.current && !pageFlip.current) {
        pageFlip.current = new PageFlip(htmlElementRef.current, props);
      }

      if (!pageFlip.current?.getFlipController()) {
        pageFlip.current?.loadFromHTML(childRef.current);
      } else {
        pageFlip.current.updateFromHtml(childRef.current);
      }

      setHandlers();
    }
    return () => removeHandlers();
  }, [pages, props, props.rtl, removeHandlers]);

  return <div ref={htmlElementRef}>{pages}</div>;
});

HTMLFlipBookForward.displayName = "HTMLFlipBookForward";

export default React.memo(HTMLFlipBookForward);
