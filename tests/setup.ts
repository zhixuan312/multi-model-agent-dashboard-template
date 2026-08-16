import '@testing-library/jest-dom/vitest';

/**
 * jsdom implements neither of these, and Radix and the charts both use them on
 * mount. Without the stubs every test that renders a Select, a Tooltip or a
 * TrendChart throws before it can assert anything.
 */
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
