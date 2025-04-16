import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { PageFlip } from "../PageFlip";
import Image from "next/image";
import styles from "./index.module.css";
import { IFlipBookProps, FlipBookRef } from "../settings";

/**
 * HTMLFlipBook component provides a page-flipping book interface
 */
const HTMLFlipBookForward = React.forwardRef<FlipBookRef, IFlipBookProps>(
  function HTMLFlipBookForward(props, ref) {
    // Component state
    const [pages, setPages] = useState<React.ReactNode[]>([]);
    const [isLoading, setLoading] = useState(true);

    // Refs
    const htmlElementRef = useRef<HTMLDivElement>(null);
    const childNodesRef = useRef<HTMLElement[]>([]);
    const blankPageRef = useRef<HTMLElement | null>(null);
    const pageFlip = useRef<PageFlip | null>(null);
    const isMounted = useRef(false);
    const isInitialized = useRef(false);
    const isInitializing = useRef(false);
    const initAttempts = useRef(0);
    const maxInitAttempts = 5;

    // Prevent props dependency in effects
    const propsRef = useRef(props);
    useEffect(() => {
      propsRef.current = props;
    }, [props]);

    // Expose pageFlip method to parent component
    useImperativeHandle(ref, () => ({
      pageFlip: () => pageFlip.current,
    }));

    /**
     * Cleanup event handlers from PageFlip
     */
    const removeHandlers = useCallback(() => {
      if (pageFlip.current) {
        pageFlip.current.removeListeners();
      }
    }, []);

    /**
     * Create a blank page element for PageFlip
     */
    const createBlankPage = useCallback(() => {
      // Skip if no blank page is needed or it already exists
      if (!propsRef.current.blankPage || blankPageRef.current) return null;

      try {
        // Check if container already exists
        const existingContainer = document.getElementById(
          "flipbook-blank-page-container"
        );
        if (existingContainer) return existingContainer;

        // Create a container element that will be hidden but contain our blank page
        const container = document.createElement("div");
        container.id = "flipbook-blank-page-container";
        container.style.position = "absolute";
        container.style.visibility = "hidden";
        container.style.pointerEvents = "none";
        document.body.appendChild(container);

        // Create the blank page element
        const blankPageElement = document.createElement("div");
        blankPageElement.id = "flipbook-blank-page";
        blankPageElement.className = "bookPage";
        blankPageElement.style.position = "relative";
        blankPageElement.style.width = "100%";
        blankPageElement.style.height = "100%";
        blankPageElement.innerHTML = '<div class="pageContent"></div>';

        // Add to DOM and update ref
        container.appendChild(blankPageElement);
        blankPageRef.current = blankPageElement;

        return container;
      } catch (error) {
        console.error("Error creating blank page:", error);
        return null;
      }
    }, []);

    /**
     * Create PageFlip settings object based on props
     */
    const createPageFlipSettings = useCallback(() => {
      const currentProps = propsRef.current;
      const settings: Record<string, unknown> = {
        startPage: currentProps.startPage,
        size: currentProps.size,
        width: currentProps.width,
        height: currentProps.height,
        minWidth: currentProps.minWidth,
        maxWidth: currentProps.maxWidth,
        minHeight: currentProps.minHeight,
        maxHeight: currentProps.maxHeight,
        rtl: currentProps.rtl,
      };

      // Add optional properties if defined
      const optionalProps = [
        "drawShadow",
        "flippingTime",
        "usePortrait",
        "startZIndex",
        "autoSize",
        "maxShadowOpacity",
        "showCover",
        "mobileScrollSupport",
        "clickEventForward",
        "useMouseEvents",
        "swipeDistance",
        "showPageCorners",
        "swipeVerticalTolerance",
        "swipeDetectionTime",
        "swipeDirectionThreshold",
      ];

      optionalProps.forEach((prop) => {
        const propValue = currentProps[prop as keyof IFlipBookProps];
        if (propValue !== undefined) {
          settings[prop] = propValue;
        }
      });

      return settings;
    }, []);

    /**
     * Initialize the PageFlip instance
     */
    const initializePageFlip = useCallback(() => {
      // Skip initialization if conditions aren't met
      if (
        isInitializing.current ||
        isInitialized.current ||
        !isMounted.current ||
        childNodesRef.current.length === 0 ||
        !htmlElementRef.current ||
        pageFlip.current
      ) {
        return;
      }

      // Set flag to prevent concurrent initialization
      isInitializing.current = true;

      try {
        // Create blank page if needed
        createBlankPage();

        // Create PageFlip instance with settings
        const settings = createPageFlipSettings();
        pageFlip.current = new PageFlip(htmlElementRef.current, settings);

        // Load pages into PageFlip
        pageFlip.current.loadFromHTML(
          childNodesRef.current,
          blankPageRef.current
        );

        // Set up event handlers
        const currentProps = propsRef.current;
        if (currentProps.onFlip) {
          pageFlip.current.on("flip", currentProps.onFlip);
        }

        if (currentProps.onChangeOrientation) {
          pageFlip.current.on(
            "changeOrientation",
            currentProps.onChangeOrientation
          );
        }

        if (currentProps.onInit) {
          pageFlip.current.on("init", currentProps.onInit);
        }

        // Mark as initialized and hide loading state
        isInitialized.current = true;
        setLoading(false);
      } catch (error) {
        console.error("Error initializing PageFlip:", error);
        pageFlip.current = null;

        // Retry initialization if not exceeded max attempts
        if (isMounted.current && initAttempts.current < maxInitAttempts) {
          initAttempts.current++;
          setTimeout(() => {
            isInitializing.current = false;
            initializePageFlip();
          }, 200 * initAttempts.current);
        }
      } finally {
        // Reset flag if fully initialized or max attempts reached
        if (isInitialized.current || initAttempts.current >= maxInitAttempts) {
          isInitializing.current = false;
        }
      }
    }, [createBlankPage, createPageFlipSettings]);

    /**
     * Collect page elements from rendered children
     */
    const collectPageElements = useCallback(() => {
      if (!htmlElementRef.current || !isMounted.current) return;

      // Find all elements with the 'bookPage' class
      const pageElements = htmlElementRef.current.querySelectorAll(".bookPage");

      // Only proceed if we found elements
      if (pageElements.length > 0) {
        // Convert NodeList to array of HTMLElements
        childNodesRef.current = Array.from(pageElements).filter(
          (el): el is HTMLElement => el instanceof HTMLElement
        );

        // Trigger initialization
        initializePageFlip();
      } else if (initAttempts.current < maxInitAttempts) {
        // Retry with increasing delay
        initAttempts.current++;
        setTimeout(collectPageElements, 100 * initAttempts.current);
      }
    }, [initializePageFlip]);

    // Mark component as mounted
    useEffect(() => {
      isMounted.current = true;

      return () => {
        isMounted.current = false;
      };
    }, []);

    // Handle blank page lifecycle - with proper cleanup between renders
    useEffect(() => {
      // Only proceed if we need a blank page and component is mounted
      if (!props.blankPage || !isMounted.current) return;

      // Create container is missing
      const container = createBlankPage();

      // Return cleanup function
      return () => {
        if (container && document.body.contains(container)) {
          try {
            document.body.removeChild(container);
            blankPageRef.current = null;
          } catch (err) {
            console.warn("Error cleaning up blank page container:", err);
          }
        }
      };
    }, [props.blankPage, createBlankPage]);

    // Process children to collect DOM nodes
    useEffect(() => {
      if (!props.children || !isMounted.current) return;

      // Clear previous references
      childNodesRef.current = [];

      // Update pages state with children
      const childList = React.Children.toArray(props.children);
      setPages(childList);

      // Schedule collection with a small delay
      const timer = setTimeout(collectPageElements, 100);

      return () => clearTimeout(timer);
    }, [props.children, collectPageElements]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        removeHandlers();

        // Reset state
        isInitialized.current = false;
        isInitializing.current = false;

        // Clean up blank page if it exists
        const container = document.getElementById(
          "flipbook-blank-page-container"
        );
        if (container && document.body.contains(container)) {
          try {
            document.body.removeChild(container);
          } catch (err) {
            console.warn("Error cleaning up container on unmount:", err);
          }
        }
      };
    }, [removeHandlers]);

    // Last resort initialization for direct navigation cases
    useEffect(() => {
      if (
        !isInitialized.current &&
        !isInitializing.current &&
        isMounted.current &&
        childNodesRef.current.length === 0
      ) {
        const retryTimeout = setTimeout(() => {
          const retryInitialization = () => {
            if (!htmlElementRef.current) return;

            const pageElements =
              htmlElementRef.current.querySelectorAll(".bookPage");

            if (pageElements.length > 0) {
              childNodesRef.current = Array.from(pageElements).filter(
                (el): el is HTMLElement => el instanceof HTMLElement
              );

              if (!isInitializing.current) {
                initializePageFlip();
              }
            } else if (initAttempts.current < maxInitAttempts * 2) {
              initAttempts.current++;
              setTimeout(retryInitialization, 300 * initAttempts.current);
            }
          };

          retryInitialization();
        }, 500);

        return () => clearTimeout(retryTimeout);
      }
    }, [initializePageFlip]);

    return (
      <>
        {isLoading && (
          <div className={styles.loader}>
            <Image
              sizes='100, 100, 100'
              fill
              src='data:image/png;base64,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'
              alt='hostages-ribbon'
            />
          </div>
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
  }
);

HTMLFlipBookForward.displayName = "HTMLFlipBookForward";

export default React.memo(HTMLFlipBookForward);
