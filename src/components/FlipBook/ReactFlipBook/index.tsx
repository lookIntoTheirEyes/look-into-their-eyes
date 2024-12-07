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

const HTMLFlipBookForward = React.forwardRef<
  { pageFlip: () => PageFlip | null }, // Ref Type
  IProps
>((props, ref) => {
  const htmlElementRef = useRef<HTMLDivElement | null>(null);
  const childRef = useRef<HTMLElement[]>([]);
  const pageFlip = useRef<PageFlip | null>(null);

  const [pages, setPages] = useState<ReactElement[]>([]);

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
    }
  }, []);

  useEffect(() => {
    if (pages.length === childRef.current.length && pages.length > 0) {
      return;
    }
    childRef.current = [];

    if (props.children) {
      const childList = React.Children.map(props.children, (child) =>
        React.cloneElement(child as ReactElement, {
          ref: (dom: HTMLElement | null) => {
            if (dom) {
              childRef.current.push(dom);
            }
          },
        })
      );

      setPages(childList || []);
    }
  }, [pages.length, props.children, props.rtl, refreshOnPageDelete]);

  useEffect(() => {
    const setHandlers = () => {
      const flip = pageFlip.current;

      if (flip) {
        if (props.onFlip) {
          flip.on("flip", (e: WidgetEvent) => props.onFlip?.(e));
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
