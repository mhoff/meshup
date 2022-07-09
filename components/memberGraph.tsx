// import '../styles/globals.css'

import {
  useState, useEffect, useMemo,
} from 'react';
import * as d3 from 'd3';
import * as React from 'react';
import { useTeamContext } from '../providers/team';

interface MemberNode extends d3.SimulationNodeDatum {
  id: string
  r: number
  name: string
}

interface MemberLink extends d3.SimulationLinkDatum<MemberNode> {
  source: MemberNode
  target: MemberNode
  strength: number
}

interface MemberGraphProps {
  maxWidth?: number
}

export default function MemberGraph(props: MemberGraphProps) {
  const { maxWidth = null } = props;
  const minDistBetweenNodes = 5;
  const linkColorMap = [
    'red', // strength <0
    'black', // strength 0
    'green', // strength >0
  ];

  // const svgRef = useRef<SVGSVGElement>(null);

  const { team, partitions: partitioning } = useTeamContext();
  const [animatedNodes, setAnimatedNodes] = useState<MemberNode[]>([]);
  const [animatedLinks, setAnimatedLinks] = useState<MemberLink[]>([]);
  const nodeRadius = useMemo(() => Math.max(...team.members.map((member) => member.name.length * 4), 25), [team]);

  const nodes = useMemo(
    () => team.members.map((member) => {
      const oldNode = animatedNodes.find((node) => node.id === member.id);
      if (oldNode) {
        return Object.assign(oldNode, { r: nodeRadius });
      }
      return {
        id: member.id,
        name: member.name,
        r: nodeRadius,
        x: NaN,
        y: NaN,
      };
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [team, nodeRadius],
  );

  const links = useMemo(
    () => team.connectedness.flatMap((row, rowIndex) => (row.map((conn, colIndex) => ({
      source: nodes[nodes.length - 1 - rowIndex],
      target: nodes[colIndex],
      strength: conn,
    })))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [team],
  );

  useEffect(() => {
    const linkSimulation = d3.forceLink<MemberNode, MemberLink>();
    linkSimulation.strength(((link) => (link.strength < 0 ? link.strength * 0.002 : link.strength * 0.01)));
    linkSimulation.distance(0);

    const simulation = d3.forceSimulation<MemberNode, MemberLink>()
      .force('link', linkSimulation)
      .force('charge', d3.forceManyBody().strength(-1000 - nodeRadius * 25))
      .force('collision', d3.forceCollide(nodeRadius + minDistBetweenNodes))
      .force('center', d3.forceCenter(500 / 2, 500 / 2)) // TODO
      .force('x', d3.forceX(100))
      .force('y', d3.forceY(100))
      .nodes([...nodes]);
    linkSimulation.links([...links]);

    simulation
      .on('tick', () => {
        setAnimatedNodes([...simulation.nodes()]);
        setAnimatedLinks([...linkSimulation.links()]);
      });

    simulation.alpha(0.6).restart();

    return () => { simulation.stop(); };
  }, [nodes, links, nodeRadius]);

  function getViewBox() {
    const minX = Math.min(...animatedNodes.map((n) => n.x as number)) - nodeRadius;
    const maxX = Math.max(...animatedNodes.map((n) => n.x as number)) + nodeRadius;
    const minY = Math.min(...animatedNodes.map((n) => n.y as number)) - nodeRadius;
    const maxY = Math.max(...animatedNodes.map((n) => n.y as number)) + nodeRadius;

    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  }

  const nodeColors: (i: number) => string = useMemo(() => {
    if (partitioning.length === 0) {
      return (_: number) => '#CCC';
    }
    const nPartitions = Math.max(...partitioning);
    // https://github.com/d3/d3-scale-chromatic
    return (i: number) => d3.interpolateWarm(partitioning[i] / nPartitions);
  }, [partitioning]);

  return (
    <div>
      {team.size > 1
        ? (
          <svg
            width="100%"
            style={{
              aspectRatio: 'auto',
              maxHeight: '80vh', // TODO
              ...(maxWidth !== null ? { maxWidth: `${maxWidth}px` } : {}),
            }}
            viewBox={getViewBox()}
          >
            <g strokeOpacity={0.8}>
              {animatedLinks.map((link) => (
                <line
                  key={`link-${link.source.id}-${link.target.id}`}
                  x1={link.source.x}
                  x2={link.target.x}
                  y1={link.source.y}
                  y2={link.target.y}
                  style={{ stroke: linkColorMap[Math.sign(link.strength) + 1] }}
                  strokeWidth={Math.min(2 * nodeRadius, Math.abs(link.strength) + 1)}
                  strokeDasharray={link.strength === 0 ? 5 : 0}
                />
              ))}
            </g>
            {animatedNodes.map((node, i) => (
              <g className="node" transform={`translate(${node.x}, ${node.y})`} key={node.id}>
                <circle fill={nodeColors(i)} r={node.r} />
                <text y={5} fill="black" fontSize={13} textAnchor="middle">{node.name}</text>
              </g>
            ))}
          </svg>
        ) : 'More team members required.'}
    </div>
  );
}

MemberGraph.defaultProps = {
  maxWidth: null,
};
