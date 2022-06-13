// import '../styles/globals.css'

import { FormEvent, useState, useRef, useEffect, useMemo } from "react"
import { useTeamContext } from "../providers/team"
import * as d3 from "d3";

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

const MemberGraph: React.FC<{width: number, height: number}> = ({width, height}) => {
  const nodeRadius = 25

  // const svgRef = useRef<SVGSVGElement>(null);

  const {team} = useTeamContext()
  const [animatedNodes, setAnimatedNodes] = useState<MemberNode[]>([])
  const [animatedLinks, setAnimatedLinks] = useState<MemberLink[]>([])

  const nodes = useMemo(
    () =>
      team.labels.map((name) => {
        const oldNode = animatedNodes.find(node => node.name == name)
        if (oldNode) {
          return oldNode
        } else {
          return {
            id: name,
            name: name,
            r: nodeRadius,
            x: NaN,
            y: NaN
          }
        }
      }),
    [team]
  )

  const links = useMemo(
    () =>
      team.connectedness.flatMap((row, rowIndex) => 
        (row.map((conn, colIndex) => {
          return {
            source: nodes[nodes.length - 1 - rowIndex],
            target: nodes[colIndex],
            strength: conn
          }
      }))),
      [team]
  )

  useEffect(() => {
    const linkSimulation = d3.forceLink<MemberNode, MemberLink>()
    linkSimulation.strength((link => link.strength * 0.01))
    linkSimulation.distance(0)

    const simulation = d3.forceSimulation<MemberNode, MemberLink>()
      .force("link", linkSimulation)
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("collision", d3.forceCollide(nodeRadius))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(100))
      .force("y", d3.forceY(100))
      .nodes([...nodes])
    linkSimulation.links([...links])

    simulation
      .on("tick", () => {
        setAnimatedNodes([...simulation.nodes()])
        setAnimatedLinks([...linkSimulation.links()])
    })
      
    simulation.alpha(0.6).restart()

    return () => { simulation.stop() }
  }, [nodes, links]);

  return (
    <div>
      <h1>Team Members</h1>
      <svg width={width} height={height}>
        <g stroke={"#999"} strokeOpacity={0.8}>
          {animatedLinks.map(link => (
            <line
              key={`link-${link.source.id}-${link.target.id}`}
              x1={link.source.x}
              x2={link.target.x}
              y1={link.source.y}
              y2={link.target.y}
              strokeWidth={Math.min(2 * nodeRadius, link.strength + 1)}
            />
          ))}
        </g>
        {animatedNodes.map(node => (
          <g className={"node"} transform={`translate(${node.x}, ${node.y})`} key={node.id}>
            <circle fill={"black"} r={node.r}></circle>
            <text y={5} fill={"red"} textAnchor={"middle"}>{node.name}</text>
          </g>
        ))}
      </svg>
    </div>
    )
}

export default MemberGraph
