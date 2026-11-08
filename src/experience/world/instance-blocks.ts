import { Group, InstancedMesh, Mesh, type BoxGeometry, type MeshStandardMaterial } from 'three';
import type { Object3D } from 'three';

function isGroup(object: Object3D): object is Group {
  return object instanceof Group;
}

export function instanceBlocks(root: Group, geometry: BoxGeometry): InstancedMesh[] {
  const instances: InstancedMesh[] = [];
  const groups: Group[] = [];
  root.traverse((object) => {
    if (isGroup(object)) groups.push(object);
  });
  for (const group of groups) {
    const batches = new Map<MeshStandardMaterial, Mesh<BoxGeometry, MeshStandardMaterial>[]>();
    for (const child of group.children) {
      if (
        !(child instanceof Mesh) ||
        child instanceof InstancedMesh ||
        child.name ||
        child.geometry !== geometry
      )
        continue;
      // Os blocos deste construtor usam exclusivamente BoxGeometry e MeshStandardMaterial.
      const block = child as Mesh<BoxGeometry, MeshStandardMaterial>;
      const batch = batches.get(block.material) ?? [];
      batch.push(block);
      batches.set(block.material, batch);
    }
    for (const [material, blocks] of batches) {
      const mesh = new InstancedMesh(geometry, material, blocks.length);
      blocks.forEach((block, index) => {
        block.updateMatrix();
        mesh.setMatrixAt(index, block.matrix);
        group.remove(block);
      });
      group.add(mesh);
      instances.push(mesh);
    }
  }
  return instances;
}
