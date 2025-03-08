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
import Image from "next/image";

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
        pageFlip.current?.loadFromHTML(childRef.current, blankPageRef.current);
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
      {isLoading && (
        <>
          <div className={styles.loader}>
            <Image
              sizes='100, 100, 100'
              fill
              src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAJ3UlEQVR4nO1dC7BWUxT+7r1dUaJCxHgmj5JX3vIqaUqovBpCoceUd8QgjUdEGkZUg4iiqcYUKVMKySPSeFdGRSiU9FKp7v1/s8Y6M2fWrH3e5//P/5/zzZyZe8+/9j7nrH323muv9e11gAwZMmTIkKH8sT+ALgAeAzANwCIAfwD4G0AtgDz/Tee+BDCdZS8DcEixb74cUAfABQBeAPArKzzM8QfX1QlAdbEfrtTQG8DvETSC6VgN4OZiP2Sp4OQYG0IenYv9sKWAqQblrQcwA8AQAN254Q4G0IiHoGr+m861ZpkhXGaDoc6l2fDljHMVpeUAtAdQFaKRq7ju35T6aXjMYMDnhjf58Ig0tk6p+6esl+jo4DDWXxhBYzR1qD/rJQrmOSjs7gga5HyH+rNeInC6izU0LYIGud/lGmQEZGC8IZQzD8AO2/9rAFSE1NYMcQ25zvkka43/sQ+A7UI5Hdg1Yj93RAiFVbJbxV7fpUovOTFrFOA2oZTF3BtGi/M92Ro6E8Bg9lUtZkXv5B5Ff3/HQ9y9AE5lk7elqOtHVvxX4vyzWYMAXwulDGSl9BTnVwHYHGA1vkG5xot8jX7iPJnFddPcKCcJhewA0IR/axFA+V6Pa/kaDQBsEr91Q4oxXChjuhj3t8bUIHZ3/AvitwlIMRYLZfQSvy9XlElD1yv8lp8BoBmA+gB24d5F80YfAJMArDWUt6O9MsRRXalDM6GIGgB7C5mbhcz3Pq9RyQ1jr+NxIVOtuFQoDpM63CiUMN8QJbSigdbR3GeQ609RnjzBEq8ImWFIIV4WShhqkPtUyN0Xwj9GQ6CG64QcXTN1WCqU0NEgN0jIfROi0R81yB0o5HayBZYq2F0jeV6xm+aanJAlc9kNDZR1y/EO8r8I2VZIGdYIBRzpIPuBkKVVvBv6iDJLXOTleoR6TaqwQCigk4PsdYppWs+l/oWiDLloTGgiZLezQZAqjPUR86gHYKOQv8GHB+AfAA0d5M8S8t8ihejnsErXMEZRmsklP1HIUlknDBTy45FCSA/s37yQc5KXkzutsiUOYSvJzwQtF4+p5GzR2/2XT8VNF/LvKDJPCxkyCNywSpQ5BSnFm0IR/V3kzxbyOWHKNuH5wi5D3F4nHCXkN6eZanqnUMbrAawzalRT71jqgc/VX5SZiRTjNKGMtR7MzW5KLzmJ1w3bxG89AjAl70KKUUeJdbfzMPd8IcrMUOIaXnrHbsoQ57SaTwVeEwp5zkOZdqKM5b63/3+lh3o6izIrI2C3lDy6K/ScSg/lZimNYh0LPCpW9qpnIniekkdDhQZ0podyJyixEj/ltViJtq5JJd4WihkRcLijY7LHsh0VgyK15q7E1QrXtsJDOcndIn/XAR6vOV6UHRXyGcoK9RVr52yXMu0VV4pXl0c9JVbSJoLnKCtMEgqiOLcJjZXNNwt9bOqh9UlmXfkc07c6uMylN/dfnxG+j0X5B32UTQ0qAfwsFEUuere3O88uGK84Vlm/HBThc5QVhghlfScm92OVueYjn/sPR4nyZOFlMOBAZcXd1jZvSCbjOp9ZGhookceLs9bw55Kfxj1ArsxrXeLwXrY+rExj7NwvzlHGeMksDDIRVytUnztieoaywyIHP5UVKfTi77Kjp8Jc2SOm+y/7lXteEK6dGCQaKthAsNfzREz3XpaoVoYXK2kMpc7wiy6iHmJNZqauD7RVXBv/GJjrbqjk/Fn2uoiVclWAulKJzkoodluIPRvaQtKy0ohumsEBVygkbPr/ooBa28WwC8s6crZNphkUK6hGGVrCbMK8XWlceY08ewgyiAVbTihpO/eYoNhTIeIN5wb+V2mUEQFM6bJDHY5jS+VscdjA4xWy3jXcSODcWVpSs5lpXpvsBWCOopR1zNcKg9bK0CQ9xydyYkx5/a/TmMX0ZMXVnue1B5Gqw6BK2RvyjcEjTInRVhheiihydJUE+hvG8A9tWRzC4CalbsqVZQJd8z2DBTa0nJ2PTRRPrnWMjmizflNlbnjLQ7kq3r8uDQtrR25UKQYTg0sUDlSee0rfiK5RoeTE2uhzr2BXJV5ieQn6lgOrcV8Arxp6xRImu0WFmyLKpdic5xztnufx9oWSQyW7JdY7DFFumzb9oIWSqGZOiDe6Hm9t0JiRdJ17SolUd5Zi5djXAjR8RYm6SiKyzRGZrkRJ/cGhh/uNWBYUtMF/iuHmc5xVQSaXiQIjlOsNiLB+2rLwpMHlYi0mj0aCQPGJ5xWnoH2fBq2M40AXxTJaEJML5DQOjmnPSI01DsChKCIa8V4OyVy3uz+GxJgyr6WSfcGyiIguFAeqma6q5eHKsy5GsW4KjrmGm9rJ+y4otVJcaAxgmeH6eXa5k0xcaMiOSm2BS8e7KAJkEMmi7MQ9nlYBmO3QGNYxK2QCfy84jDnJOcUSKzikrV6o6NsIRflzeR6T50cWKRmbnxRSkUFypQoReeuvKH0Ze46r2R8mf6cgVdwY6IO5HxtuLXA2zx7KQo0m9WOEv2ylkKlll0icmCCuSbopOGQGHcowGhcuVvKX1Bhi7ScojJVtNo5wIbKrkm4Kjt3FG1vL56LGeQYDgnxXJrRVzPEtMe2S0vRQtPSA0q1AeXSjxKmG9OIPeyh7vWL9UJKC4yK+xzPENUgnRcNEH2+tX7QxOCfH+nAaDlbKr434KwjSy0w6KRoGKcqKAhfyECOVOSVABO8xpZ4N/BGZKPBSknKlyM8IEWUzCqL1jogaA9ybRir1bfKw09cLvvQRLo4djcQ4TYrcNUR9AwwxiKkh4w/a90jy7PoI86mjuuLlycXssvGEn8RDtg6osAcVhVljchTx9kp2hsr6a10ylsJHsk3SReK+H9U7gNk42dAYY2JwpT9quNZTAXxfvUUdpIui4/4QKSqac3ZRTUHDYiQV3GJgmLzvk4o0JkRe+tjQSQkQecElBoZHDSssbvQyxHKW+1irfCbKJiKku5/ienayhmgIesTwhm6MgNPrB+caPsdKJvc1LmXrKMQK0kUiINOstnIgspkSj62IgEYaBM0diAwTHMjXrVy+3JOofFfWR7fs6OYQ+pzt8HWEQqAxkxVML8rpHvLRJyojxEPi5ojTZF+rjDM8LM0XDyRkX0YlT8oau2QnW2e7OqSkJR0kBl0Vhh/YPa59w9ziaNEXcJKYuGC14Z6X2dz488VvxIBJFBVIuiVMxOo8c3BpPkkqmio8YevIsbkrGS9BtmvHCtP8IK2oPiVEWr5cySusHbR1LnFwY4LMZ3ZjqeFgB8qTdZDlmDgMc5grepVQr9BQwR+QMY0CifzMnlyx1xSTxRejeTxK8UgnYoWumY2jOco3J6DXt1TQmp9xPTdQEsz2DBkyZMiAdOM/JTRPPi2I7A0AAAAASUVORK5CYII='
              alt='hostages-ribbon'
            />
          </div>
        </>
      )}
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
