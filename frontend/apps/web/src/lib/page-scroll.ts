export function shouldResetPageScroll(position: {
  windowX: number;
  windowY: number;
  rootY: number;
  bodyY: number;
}) {
  return (
    position.windowX !== 0 || position.windowY !== 0 || position.rootY !== 0 || position.bodyY !== 0
  );
}
