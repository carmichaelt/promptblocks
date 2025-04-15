"use client"

import { useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Sphere, Box, Torus } from "@react-three/drei"
import * as THREE from "three"

interface ShapeProps {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  color: React.ReactElement
  Component: typeof Box | typeof Sphere | typeof Torus
}

function FloatingShape({ position, rotation, scale, color, Component }: ShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const initialPosition = useRef(position)
  const time = useRef(Math.random() * 100)

  useFrame((state) => {
    if (!meshRef.current) return
    time.current += 0.005

    // Floating animation
    meshRef.current.position.y = initialPosition.current[1] + Math.sin(time.current) * 0.3
    meshRef.current.position.x = initialPosition.current[0] + Math.sin(time.current * 0.8) * 0.2
    meshRef.current.position.z = initialPosition.current[2] + Math.cos(time.current * 0.6) * 0.2

    // Slow rotation
    meshRef.current.rotation.x += 0.001
    meshRef.current.rotation.y += 0.002
  })

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <Component>
        {color}
      </Component>
    </mesh>
  )
}

const shapes: ShapeProps[] = [
  {
    Component: Box,
    position: [-4, 2, -5],
    rotation: [0.5, 0.5, 0],
    scale: 0.6,
    color: <meshStandardMaterial color="#4338ca" opacity={0.3} transparent />,
  },
  {
    Component: Sphere,
    position: [4, -2, -8],
    rotation: [0, 0, 0],
    scale: 0.8,
    color: <meshStandardMaterial color="#7e22ce" opacity={0.3} transparent />,
  },
  {
    Component: Torus,
    position: [-3, -3, -5],
    rotation: [0.5, 0, 0],
    scale: 0.4,
    color: <meshStandardMaterial color="#be185d" opacity={0.3} transparent />,
  },
  {
    Component: Box,
    position: [3, 3, -7],
    rotation: [0.3, 0.4, 0],
    scale: 0.5,
    color: <meshStandardMaterial color="#0369a1" opacity={0.3} transparent />,
  },
]

function Shapes() {
  return (
    <>
      {shapes.map((shape, i) => (
        <FloatingShape key={i} {...shape} />
      ))}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </>
  )
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        style={{ background: "transparent" }}
      >
        <Shapes />
      </Canvas>
    </div>
  )
} 