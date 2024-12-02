import { PageFlip } from "../PageFlip";

export type DataType = number | null;

export interface WidgetEvent {
  data: DataType;
  object: PageFlip;
}

type EventCallback = (e: WidgetEvent) => void;

export abstract class EventObject {
  private events: Map<string, EventCallback[]> = new Map();

  public on(eventName: string, callback: EventCallback): this {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, [callback]);
    } else {
      this.events.get(eventName)!.push(callback);
    }

    return this;
  }

  public off(eventName: string): void {
    this.events.delete(eventName);
  }

  protected trigger(
    eventName: string,
    app: PageFlip,
    data: DataType = null
  ): void {
    const callbacks = this.events.get(eventName);
    if (!callbacks) return;

    for (const callback of callbacks) {
      callback({ data, object: app });
    }
  }
}
