import type { Edge, Node } from "@xyflow/react";

export type FlowEdgeLineStyle = "solid" | "dashed" | "dotted";

export type FlowNodeVariant =
  | "start"
  | "process"
  | "decision"
  | "data"
  | "document"
  | "image"
  | "text"
  | "icon"
  | "group";

export type FlowTextAlign = "left" | "center" | "right";
export type FlowTextVerticalAlign = "top" | "middle" | "bottom";

export type FlowNodeData = {
  label: string;
  variant: FlowNodeVariant;
  iconName?: string;
  iconSet?: string;
  svgSrc?: string;
  imageSrc?: string;
  fill?: string;
  stroke?: string;
  textColor?: string;
  textAlign?: FlowTextAlign;
  textVerticalAlign?: FlowTextVerticalAlign;
  onChange?: (id: string, label: string) => void;
};

export type FlowEdgeData = {
  lineStyle?: FlowEdgeLineStyle;
};

export type FlowNodeType = Node<FlowNodeData, "maketarFlow">;
export type FlowEdgeType = Edge<FlowEdgeData>;
export type FlowTemplateType = "purchase-flow" | "approval-flow" | "support-flow";
