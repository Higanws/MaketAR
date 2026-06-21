import { MarkerType } from "@xyflow/react";
import { describe, expect, it } from "vitest";

import {
  applyFlowEdgeLineStyle,
  defaultFlowSourceHandle,
  defaultFlowTargetHandle,
  getFlowEdgeLineStyle,
  makeFlowTemplate,
  normalizeFlowEdges,
} from "./flow-templates";

const flowTemplateTypes = ["purchase-flow", "approval-flow", "support-flow"] as const;

describe("flow edge styles", () => {
  it("normalizes missing handles and keeps solid as the default line style", () => {
    const [edge] = normalizeFlowEdges([{ id: "e1", source: "a", target: "b" }]);

    expect(edge.sourceHandle).toBe(defaultFlowSourceHandle);
    expect(edge.targetHandle).toBe(defaultFlowTargetHandle);
    expect(edge.type).toBe("smoothstep");
    expect(edge.markerEnd).toEqual({ type: MarkerType.ArrowClosed });
    expect(edge.data?.lineStyle).toBe("solid");
    expect(edge.style?.strokeDasharray).toBeUndefined();
  });

  it("applies dashed and dotted line styles", () => {
    const dashed = applyFlowEdgeLineStyle({ id: "e1", source: "a", target: "b" }, "dashed");
    const dotted = applyFlowEdgeLineStyle({ id: "e2", source: "a", target: "b" }, "dotted");

    expect(getFlowEdgeLineStyle(dashed)).toBe("dashed");
    expect(dashed.style?.strokeDasharray).toBe("9 7");
    expect(getFlowEdgeLineStyle(dotted)).toBe("dotted");
    expect(dotted.style?.strokeDasharray).toBe("2 7");
  });

  it("creates flow templates with decision edges anchored to diamond points", () => {
    const supportFlow = makeFlowTemplate("support-flow");
    const decisionEdges = supportFlow.edges.filter((edge) => edge.source === "support-decision");

    expect(decisionEdges.map((edge) => edge.sourceHandle)).toEqual(["top-source", "bottom-source"]);
  });

  it("repairs legacy default handles from node geometry", () => {
    const supportFlow = makeFlowTemplate("support-flow");
    const legacyEdges = supportFlow.edges.map((edge) => ({
      ...edge,
      sourceHandle: defaultFlowSourceHandle,
      targetHandle: defaultFlowTargetHandle,
    }));
    const repairedEdges = normalizeFlowEdges(legacyEdges, supportFlow.nodes, { repairHandles: true });
    const decisionEdges = repairedEdges.filter((edge) => edge.source === "support-decision");

    expect(decisionEdges.map((edge) => edge.sourceHandle)).toEqual(["top-source", "bottom-source"]);
  });

  it("spreads multiple connections across free anchors on the same node", () => {
    const supportFlow = makeFlowTemplate("support-flow");
    const processNode = supportFlow.nodes.find((node) => node.id === "support-triage");
    const decisionNode = supportFlow.nodes.find((node) => node.id === "support-decision");
    const closeNode = supportFlow.nodes.find((node) => node.id === "support-close");
    expect(processNode && decisionNode && closeNode).toBeTruthy();

    const repairedEdges = normalizeFlowEdges(
      [
        { id: "e1", source: "support-triage", target: "support-decision" },
        { id: "e2", source: "support-triage", target: "support-close" },
      ],
      supportFlow.nodes,
      { repairHandles: true },
    );

    expect(new Set(repairedEdges.map((edge) => edge.sourceHandle)).size).toBe(2);
  });

  it("keeps explicitly selected handles for new connections", () => {
    const supportFlow = makeFlowTemplate("support-flow");
    const [edge] = normalizeFlowEdges(
      [{ id: "e1", source: "support-decision", target: "support-close", sourceHandle: "left-source", targetHandle: "top-target" }],
      supportFlow.nodes,
    );

    expect(edge.sourceHandle).toBe("left-source");
    expect(edge.targetHandle).toBe("top-target");
  });

  it("keeps all flow templates aligned with current node rules", () => {
    for (const template of flowTemplateTypes) {
      const flow = makeFlowTemplate(template);
      const groups = flow.nodes.filter((node) => node.data.variant === "group");

      expect(groups.length).toBeGreaterThan(0);
      expect(groups.every((node) => node.zIndex === -1)).toBe(true);
      expect(flow.nodes.some((node) => node.data.variant === "document")).toBe(false);
      expect(flow.edges.every((edge) => edge.type === "smoothstep")).toBe(true);
      expect(flow.edges.every((edge) => edge.reconnectable ?? true)).toBe(true);
    }
  });
});
