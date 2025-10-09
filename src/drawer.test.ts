import { world } from "@minecraft/server";
import { BlockDrawer, ParticleDrawer } from "./drawer";
import {
  ArrowShape,
  BoxShape,
  CircleShape,
  ConeShape,
  CylinderShape,
  LineShape,
  SphereShape,
  TextShape,
} from "./shape";

export default () => {
  const dim = world.getDimension("overworld");
  const line = new LineShape({ x: 66, y: 149, z: 68 }, { x: 66, y: 149, z: 74 });
  const arrow = new ArrowShape({ x: 77, y: 146, z: 81 }, { x: 77, y: 146, z: 88 });
  const box = new BoxShape({ x: 64, y: 147, z: 75 }, { x: 68, y: 151, z: 67 });
  const sphere = new SphereShape({ x: 65, y: 141, z: 111 });
  sphere.scale = 2;
  const circle = new CircleShape({ x: 77, y: 146, z: 69 });
  circle.scale = 2;
  const text = new TextShape({ x: 95, y: 160, z: 89 }, "Hello World!");
  text.material = "lime_concrete";
  text.rotateY(-90);

  const temp = new BoxShape({ x: 68, y: 144, z: 62 }, { x: 72, y: 140, z: 58 });
  temp.material = "lpsmods:barrier";
  temp.totalTimeLeft = 2;

  const capsule = new ConeShape({ x: 74, y: 138, z: 136 }, 3, 8);
  const cylinder = new CylinderShape({ x: 93, y: 142, z: 115 }, 3, 8);

  const drawer = new BlockDrawer(dim.id);
  drawer.addShape(line);
  drawer.addShape(arrow);
  drawer.addShape(box);
  drawer.addShape(sphere);
  drawer.addShape(circle);
  drawer.addShape(text);
  drawer.addShape(capsule);
  drawer.addShape(cylinder);

  const pDrawer = new ParticleDrawer(dim.id, 21);
  pDrawer.addShape(temp);
};
