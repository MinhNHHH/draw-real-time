type messageCreateObject = {
  pointer: { x: number; y: number };
  option: {
    id: string;
    stroke?: string;
    strokeWidth?: number;
    fill?: "";
    type?: string;
    perPixelTargetFind: boolean;
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;
    angle?: number;
  };
};
type messageHandleDraw = {
  event: string;
  message?: any;
};

export type { messageCreateObject, messageHandleDraw };
