// Gerado a partir do lucide-react 1.17.0 (ISC). Não edite à mão.
//
// Ícones para Server Components da landing, do onboarding e do 404, sem JS.
// O Icon do lucide-react é "use client": cada ícone renderizado no servidor
// vira uma client reference, e o Next resolve essa referência com os chunks
// de app/(app)/layout (Firebase + Clerk) por causa do merge de manifests dos
// route groups da raiz. Aqui é SVG puro.
import type { CSSProperties } from "react";

type IconNode = [string, Record<string, string>][];

export type StaticIconProps = {
  size?: number | string;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
  color?: string;
  "aria-hidden"?: boolean | "true" | "false";
  "aria-label"?: string;
};

function render(name: string, node: IconNode, props: StaticIconProps) {
  const { size = 24, strokeWidth = 2, className, style, color = "currentColor" } = props;
  const label = props["aria-label"];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ? `lucide lucide-${name} ${className}` : `lucide lucide-${name}`}
      style={style}
      aria-hidden={label ? undefined : (props["aria-hidden"] ?? true)}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      {node.map(([tag, attrs]) => {
        const { key, ...rest } = attrs;
        const Tag = tag as "path";
        return <Tag key={key} {...rest} />;
      })}
    </svg>
  );
}

const ArrowRightNode: IconNode = [["path",{"d":"M5 12h14","key":"1ays0h"}],["path",{"d":"m12 5 7 7-7 7","key":"xquz4c"}]];
export function ArrowRight(props: StaticIconProps) {
  return render("arrow-right", ArrowRightNode, props);
}

const MessageCircleNode: IconNode = [["path",{"d":"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719","key":"1sd12s"}]];
export function MessageCircle(props: StaticIconProps) {
  return render("message-circle", MessageCircleNode, props);
}

const SparklesNode: IconNode = [["path",{"d":"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z","key":"1s2grr"}],["path",{"d":"M20 2v4","key":"1rf3ol"}],["path",{"d":"M22 4h-4","key":"gwowj6"}],["circle",{"cx":"4","cy":"20","r":"2","key":"6kqj1y"}]];
export function Sparkles(props: StaticIconProps) {
  return render("sparkles", SparklesNode, props);
}

const CopyNode: IconNode = [["rect",{"width":"14","height":"14","x":"8","y":"8","rx":"2","ry":"2","key":"17jyea"}],["path",{"d":"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2","key":"zix9uf"}]];
export function Copy(props: StaticIconProps) {
  return render("copy", CopyNode, props);
}

const ShieldCheckNode: IconNode = [["path",{"d":"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z","key":"oel41y"}],["path",{"d":"m9 12 2 2 4-4","key":"dzmm74"}]];
export function ShieldCheck(props: StaticIconProps) {
  return render("shield-check", ShieldCheckNode, props);
}

const LockNode: IconNode = [["rect",{"width":"18","height":"11","x":"3","y":"11","rx":"2","ry":"2","key":"1w4ew1"}],["path",{"d":"M7 11V7a5 5 0 0 1 10 0v4","key":"fwvmzm"}]];
export function Lock(props: StaticIconProps) {
  return render("lock", LockNode, props);
}

const ClockNode: IconNode = [["circle",{"cx":"12","cy":"12","r":"10","key":"1mglay"}],["path",{"d":"M12 6v6l4 2","key":"mmk7yg"}]];
export function Clock(props: StaticIconProps) {
  return render("clock", ClockNode, props);
}

const CheckNode: IconNode = [["path",{"d":"M20 6 9 17l-5-5","key":"1gmf2c"}]];
export function Check(props: StaticIconProps) {
  return render("check", CheckNode, props);
}

const SearchXNode: IconNode = [["path",{"d":"m13.5 8.5-5 5","key":"1cs55j"}],["path",{"d":"m8.5 8.5 5 5","key":"a8mexj"}],["circle",{"cx":"11","cy":"11","r":"8","key":"4ej97u"}],["path",{"d":"m21 21-4.3-4.3","key":"1qie3q"}]];
export function SearchX(props: StaticIconProps) {
  return render("search-x", SearchXNode, props);
}
