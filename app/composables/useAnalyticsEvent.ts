type AnalyticsEventData = Record<string, unknown>;

export function useAnalyticsEvent() {
  const pushEvent = <T extends AnalyticsEventData = AnalyticsEventData>(
    event: string,
    data: T = {} as T,
  ): void => {
    if (
      process.env.NODE_ENV === 'production' &&
            import.meta.client &&
            typeof window !== 'undefined' &&
            'dataLayer' in window &&
            Array.isArray((window as any).dataLayer)
    ) {
      (window as any).dataLayer.push({ event, ...data });
    } else {
      console.log('pushEvent', { event, ...data });
    }
  };

  return { pushEvent };
}
