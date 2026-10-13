import { Handle, Position } from "@xyflow/react";

const FLOW_HANDLE_SIZE = 14;
const flowHandleClass = "!z-20 !rounded-full !border-2 !border-white !bg-blue-500 !shadow-md";
const flowHandlePositions = [
  { id: "top", position: Position.Top, style: { top: 0, left: "50%", transform: "translate(-50%, -50%)" } },
  { id: "right", position: Position.Right, style: { top: "50%", left: "100%", transform: "translate(-50%, -50%)" } },
  { id: "bottom", position: Position.Bottom, style: { top: "100%", left: "50%", transform: "translate(-50%, -50%)" } },
  { id: "left", position: Position.Left, style: { top: "50%", left: 0, transform: "translate(-50%, -50%)" } },
] as const;

const flowHandleStyle = {
  width: FLOW_HANDLE_SIZE,
  height: FLOW_HANDLE_SIZE,
  minWidth: FLOW_HANDLE_SIZE,
  minHeight: FLOW_HANDLE_SIZE,
};

export function FlowNodeHandles() {
  return (
    <>
      {flowHandlePositions.map((handle) => (
        <Handle
          key={`${handle.id}-source`}
          id={`${handle.id}-source`}
          type="source"
          position={handle.position}
          className={flowHandleClass}
          style={{ ...flowHandleStyle, ...handle.style }}
        />
      ))}
    </>
  );
}
