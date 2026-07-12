import '../../assets/Link.css'
import type { PositionedTableNodeData } from "../../data/TreeNodeData";

type LinkProps = {
  source: PositionedTableNodeData;
  target: PositionedTableNodeData;
};

export default function CustomLink({ source, target }: Readonly<LinkProps>) {
  const sourcePoint = [
    source.x,
    source.y + Math.max(source.data.height, 33) + 4
  ]
  
  const targetPoint = [
    target.x,
    target.y + 2
  ]

  const path = `
  M${sourcePoint[0]},${sourcePoint[1]}
  L${targetPoint[0]},${targetPoint[1]}
`;

  const isGrey = source.data.isGreyed || target.data.isGreyed;

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        className={
          `${isGrey ? 'node-grey' : ''}`
        }
      />
      <path
        d={path}
        fill="none"
        stroke="#555"
        strokeWidth={1.5}
        className={
          `${isGrey ? 'node-grey' : ''}`
        }
      />
    </g>
  );
}
