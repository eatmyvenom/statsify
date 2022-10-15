/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  BoxGeometry,
  DoubleSide,
  FrontSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Texture,
  Vector2,
} from "bundle";
import { ModelType } from "./utils";

function setUVs(
  box: BoxGeometry,
  u: number,
  v: number,
  width: number,
  height: number,
  depth: number,
  textureWidth: number,
  textureHeight: number
): void {
  const toFaceVertices = (x1: number, y1: number, x2: number, y2: number) => [
    new Vector2(x1 / textureWidth, 1 - y2 / textureHeight),
    new Vector2(x2 / textureWidth, 1 - y2 / textureHeight),
    new Vector2(x2 / textureWidth, 1 - y1 / textureHeight),
    new Vector2(x1 / textureWidth, 1 - y1 / textureHeight),
  ];

  const top = toFaceVertices(u + depth, v, u + width + depth, v + depth);
  const bottom = toFaceVertices(u + width + depth, v, u + width * 2 + depth, v + depth);
  const left = toFaceVertices(u, v + depth, u + depth, v + depth + height);
  const front = toFaceVertices(
    u + depth,
    v + depth,
    u + width + depth,
    v + depth + height
  );
  const right = toFaceVertices(
    u + width + depth,
    v + depth,
    u + width + depth * 2,
    v + height + depth
  );
  const back = toFaceVertices(
    u + width + depth * 2,
    v + depth,
    u + width * 2 + depth * 2,
    v + height + depth
  );

  const uvAttr = (box.attributes as any).uv;
  uvAttr.copyVector2sArray([
    right[3],
    right[2],
    right[0],
    right[1],
    left[3],
    left[2],
    left[0],
    left[1],
    top[3],
    top[2],
    top[0],
    top[1],
    bottom[0],
    bottom[1],
    bottom[3],
    bottom[2],
    front[3],
    front[2],
    front[0],
    front[1],
    back[3],
    back[2],
    back[0],
    back[1],
  ]);
  uvAttr.needsUpdate = true;
}

function setSkinUVs(
  box: BoxGeometry,
  u: number,
  v: number,
  width: number,
  height: number,
  depth: number
): void {
  setUVs(box, u, v, width, height, depth, 64, 64);
}

function setCapeUVs(
  box: BoxGeometry,
  u: number,
  v: number,
  width: number,
  height: number,
  depth: number
): void {
  setUVs(box, u, v, width, height, depth, 64, 32);
}

/**
 * Notice that innerLayer and outerLayer may NOT be the direct children of the Group.
 */
export class BodyPart extends Group {
  public constructor(
    public readonly innerLayer: Object3D,
    public readonly outerLayer: Object3D
  ) {
    super();
    innerLayer.name = "inner";
    outerLayer.name = "outer";
  }
}

export class SkinObject extends Group {
  // body parts
  public readonly head: BodyPart;
  public readonly body: BodyPart;
  public readonly rightArm: BodyPart;
  public readonly leftArm: BodyPart;
  public readonly rightLeg: BodyPart;
  public readonly leftLeg: BodyPart;

  private modelListeners: Array<() => void> = []; // called when model(slim property) is changed
  private slim = false;

  private _map: Texture | null = null;
  private layer1Material: MeshStandardMaterial;
  private layer1MaterialBiased: MeshStandardMaterial;
  private layer2Material: MeshStandardMaterial;
  private layer2MaterialBiased: MeshStandardMaterial;

  public constructor() {
    super();

    this.layer1Material = new MeshStandardMaterial({
      side: FrontSide,
    });
    this.layer2Material = new MeshStandardMaterial({
      side: DoubleSide,
      transparent: true,
      alphaTest: 1e-5,
    });

    this.layer1MaterialBiased = this.layer1Material.clone();
    this.layer1MaterialBiased.polygonOffset = true;
    this.layer1MaterialBiased.polygonOffsetFactor = 1;
    this.layer1MaterialBiased.polygonOffsetUnits = 1;

    this.layer2MaterialBiased = this.layer2Material.clone();
    this.layer2MaterialBiased.polygonOffset = true;
    this.layer2MaterialBiased.polygonOffsetFactor = 1;
    this.layer2MaterialBiased.polygonOffsetUnits = 1;

    // Head
    const headBox = new BoxGeometry(8, 8, 8);
    setSkinUVs(headBox, 0, 0, 8, 8, 8);
    const headMesh = new Mesh(headBox, this.layer1Material as any);

    const head2Box = new BoxGeometry(9, 9, 9);
    setSkinUVs(head2Box, 32, 0, 8, 8, 8);
    const head2Mesh = new Mesh(head2Box, this.layer2Material as any);

    this.head = new BodyPart(headMesh, head2Mesh);
    this.head.name = "head";
    this.head.add(headMesh, head2Mesh);
    (headMesh as any).position.y = 4;
    (head2Mesh as any).position.y = 4;
    this.add(this.head);

    // Body
    const bodyBox = new BoxGeometry(8, 12, 4);
    setSkinUVs(bodyBox, 16, 16, 8, 12, 4);
    const bodyMesh = new Mesh(bodyBox, this.layer1Material as any);

    const body2Box = new BoxGeometry(8.5, 12.5, 4.5);
    setSkinUVs(body2Box, 16, 32, 8, 12, 4);
    const body2Mesh = new Mesh(body2Box, this.layer2Material as any);

    this.body = new BodyPart(bodyMesh, body2Mesh);
    this.body.name = "body";
    this.body.add(bodyMesh, body2Mesh);
    (this.body as any).position.y = -6;
    this.add(this.body);

    // Right Arm
    const rightArmBox = new BoxGeometry();
    const rightArmMesh = new Mesh(rightArmBox, this.layer1MaterialBiased as any);
    this.modelListeners.push(() => {
      rightArmMesh.scale.x = this.slim ? 3 : 4;
      rightArmMesh.scale.y = 12;
      rightArmMesh.scale.z = 4;
      setSkinUVs(rightArmBox, 40, 16, this.slim ? 3 : 4, 12, 4);
    });

    const rightArm2Box = new BoxGeometry();
    const rightArm2Mesh = new Mesh(rightArm2Box, this.layer2MaterialBiased);
    this.modelListeners.push(() => {
      rightArm2Mesh.scale.x = this.slim ? 3.5 : 4.5;
      rightArm2Mesh.scale.y = 12.5;
      rightArm2Mesh.scale.z = 4.5;
      setSkinUVs(rightArm2Box, 40, 32, this.slim ? 3 : 4, 12, 4);
    });

    const rightArmPivot = new Group();
    rightArmPivot.add(rightArmMesh, rightArm2Mesh);
    this.modelListeners.push(() => {
      rightArmPivot.position.x = this.slim ? -0.5 : -1;
    });
    rightArmPivot.position.y = -4;

    this.rightArm = new BodyPart(rightArmMesh, rightArm2Mesh);
    this.rightArm.name = "rightArm";
    this.rightArm.add(rightArmPivot);
    this.rightArm.position.x = -5;
    this.rightArm.position.y = -2;
    this.add(this.rightArm);

    // Left Arm
    const leftArmBox = new BoxGeometry();
    const leftArmMesh = new Mesh(leftArmBox, this.layer1MaterialBiased);
    this.modelListeners.push(() => {
      leftArmMesh.scale.x = this.slim ? 3 : 4;
      leftArmMesh.scale.y = 12;
      leftArmMesh.scale.z = 4;
      setSkinUVs(leftArmBox, 32, 48, this.slim ? 3 : 4, 12, 4);
    });

    const leftArm2Box = new BoxGeometry();
    const leftArm2Mesh = new Mesh(leftArm2Box, this.layer2MaterialBiased);
    this.modelListeners.push(() => {
      leftArm2Mesh.scale.x = this.slim ? 3.5 : 4.5;
      leftArm2Mesh.scale.y = 12.5;
      leftArm2Mesh.scale.z = 4.5;
      setSkinUVs(leftArm2Box, 48, 48, this.slim ? 3 : 4, 12, 4);
    });

    const leftArmPivot = new Group();
    leftArmPivot.add(leftArmMesh, leftArm2Mesh);
    this.modelListeners.push(() => {
      leftArmPivot.position.x = this.slim ? 0.5 : 1;
    });
    leftArmPivot.position.y = -4;

    this.leftArm = new BodyPart(leftArmMesh, leftArm2Mesh);
    this.leftArm.name = "leftArm";
    this.leftArm.add(leftArmPivot);
    this.leftArm.position.x = 5;
    this.leftArm.position.y = -2;
    this.add(this.leftArm);

    // Right Leg
    const rightLegBox = new BoxGeometry(4, 12, 4);
    setSkinUVs(rightLegBox, 0, 16, 4, 12, 4);
    const rightLegMesh = new Mesh(rightLegBox, this.layer1MaterialBiased);

    const rightLeg2Box = new BoxGeometry(4.5, 12.5, 4.5);
    setSkinUVs(rightLeg2Box, 0, 32, 4, 12, 4);
    const rightLeg2Mesh = new Mesh(rightLeg2Box, this.layer2MaterialBiased);

    const rightLegPivot = new Group();
    rightLegPivot.add(rightLegMesh, rightLeg2Mesh);
    rightLegPivot.position.y = -6;

    this.rightLeg = new BodyPart(rightLegMesh, rightLeg2Mesh);
    this.rightLeg.name = "rightLeg";
    this.rightLeg.add(rightLegPivot);
    this.rightLeg.position.x = -1.9;
    this.rightLeg.position.y = -12;
    this.rightLeg.position.z = -0.1;
    this.add(this.rightLeg);

    // Left Leg
    const leftLegBox = new BoxGeometry(4, 12, 4);
    setSkinUVs(leftLegBox, 16, 48, 4, 12, 4);
    const leftLegMesh = new Mesh(leftLegBox, this.layer1MaterialBiased);

    const leftLeg2Box = new BoxGeometry(4.5, 12.5, 4.5);
    setSkinUVs(leftLeg2Box, 0, 48, 4, 12, 4);
    const leftLeg2Mesh = new Mesh(leftLeg2Box, this.layer2MaterialBiased);

    const leftLegPivot = new Group();
    leftLegPivot.add(leftLegMesh, leftLeg2Mesh);
    leftLegPivot.position.y = -6;

    this.leftLeg = new BodyPart(leftLegMesh, leftLeg2Mesh);
    this.leftLeg.name = "leftLeg";
    this.leftLeg.add(leftLegPivot);
    this.leftLeg.position.x = 1.9;
    this.leftLeg.position.y = -12;
    this.leftLeg.position.z = -0.1;
    this.add(this.leftLeg);

    this.modelType = "default";
  }

  public get map(): Texture | null {
    return this._map;
  }

  public set map(newMap: Texture | null) {
    this._map = newMap;

    this.layer1Material.map = newMap;
    this.layer1Material.needsUpdate = true;

    this.layer1MaterialBiased.map = newMap;
    this.layer1MaterialBiased.needsUpdate = true;

    this.layer2Material.map = newMap;
    this.layer2Material.needsUpdate = true;

    this.layer2MaterialBiased.map = newMap;
    this.layer2MaterialBiased.needsUpdate = true;
  }

  public get modelType(): ModelType {
    return this.slim ? "slim" : "default";
  }

  public set modelType(value: ModelType) {
    this.slim = value === "slim";
    this.modelListeners.forEach((listener) => listener());
  }

  public setInnerLayerVisible(value: boolean): void {
    this.getBodyParts().forEach((part) => (part.innerLayer.visible = value));
  }

  public setOuterLayerVisible(value: boolean): void {
    this.getBodyParts().forEach((part) => (part.outerLayer.visible = value));
  }

  public resetJoints(): void {
    this.head.rotation.set(0, 0, 0);
    this.leftArm.rotation.set(0, 0, 0);
    this.rightArm.rotation.set(0, 0, 0);
    this.leftLeg.rotation.set(0, 0, 0);
    this.rightLeg.rotation.set(0, 0, 0);
  }

  private getBodyParts(): Array<BodyPart> {
    return this.children.filter((it: any) => it instanceof BodyPart) as Array<BodyPart>;
  }
}

export class CapeObject extends Group {
  public readonly cape: Mesh;

  private material: MeshStandardMaterial;

  public constructor() {
    super();

    this.material = new MeshStandardMaterial({
      side: DoubleSide,
      transparent: true,
      alphaTest: 1e-5,
    });

    // +z (front) - inside of cape
    // -z (back) - outside of cape
    const capeBox = new BoxGeometry(10, 16, 1);
    setCapeUVs(capeBox, 0, 0, 10, 16, 1);
    this.cape = new Mesh(capeBox, this.material);
    this.cape.position.y = -8;
    this.cape.position.z = 0.5;
    this.add(this.cape);
  }

  public get map(): Texture | null {
    return this.material.map;
  }

  public set map(newMap: Texture | null) {
    this.material.map = newMap;
    this.material.needsUpdate = true;
  }
}

export class ElytraObject extends Group {
  public readonly leftWing: Group;
  public readonly rightWing: Group;

  private material: MeshStandardMaterial;

  public constructor() {
    super();

    this.material = new MeshStandardMaterial({
      side: DoubleSide,
      transparent: true,
      alphaTest: 1e-5,
    });

    const leftWingBox = new BoxGeometry(12, 22, 4);
    setCapeUVs(leftWingBox, 22, 0, 10, 20, 2);
    const leftWingMesh = new Mesh(leftWingBox, this.material);
    leftWingMesh.position.x = -5;
    leftWingMesh.position.y = -10;
    leftWingMesh.position.z = -1;
    this.leftWing = new Group();
    this.leftWing.add(leftWingMesh);
    this.add(this.leftWing);

    const rightWingBox = new BoxGeometry(12, 22, 4);
    setCapeUVs(rightWingBox, 22, 0, 10, 20, 2);
    const rightWingMesh = new Mesh(rightWingBox, this.material);
    rightWingMesh.scale.x = -1;
    rightWingMesh.position.x = 5;
    rightWingMesh.position.y = -10;
    rightWingMesh.position.z = -1;
    this.rightWing = new Group();
    this.rightWing.add(rightWingMesh);
    this.add(this.rightWing);

    this.leftWing.position.x = 5;
    this.leftWing.rotation.x = 0.261_799_4;
    this.resetJoints();
  }

  public resetJoints(): void {
    this.leftWing.rotation.y = 0.01; // to avoid z-fighting
    this.leftWing.rotation.z = 0.261_799_4;
    this.updateRightWing();
  }

  /**
   * Mirrors the position & rotation of left wing,
   * and apply them to the right wing.
   */
  public updateRightWing(): void {
    this.rightWing.position.x = -this.leftWing.position.x;
    this.rightWing.position.y = this.leftWing.position.y;
    this.rightWing.rotation.x = this.leftWing.rotation.x;
    this.rightWing.rotation.y = -this.leftWing.rotation.y;
    this.rightWing.rotation.z = -this.leftWing.rotation.z;
  }

  public get map(): Texture | null {
    return this.material.map;
  }

  public set map(newMap: Texture | null) {
    this.material.map = newMap;
    this.material.needsUpdate = true;
  }
}

export class EarsObject extends Group {
  public readonly rightEar: Mesh;
  public readonly leftEar: Mesh;

  private material: MeshStandardMaterial;

  public constructor() {
    super();

    this.material = new MeshStandardMaterial({
      side: FrontSide,
    });
    const earBox = new BoxGeometry(8, 8, 4 / 3);
    setUVs(earBox, 0, 0, 6, 6, 1, 14, 7);

    this.rightEar = new Mesh(earBox, this.material);
    this.rightEar.name = "rightEar";
    this.rightEar.position.x = -6;
    this.add(this.rightEar);

    this.leftEar = new Mesh(earBox, this.material);
    this.leftEar.name = "leftEar";
    this.leftEar.position.x = 6;
    this.add(this.leftEar);
  }

  public get map(): Texture | null {
    return this.material.map;
  }

  public set map(newMap: Texture | null) {
    this.material.map = newMap;
    this.material.needsUpdate = true;
  }
}

export type BackEquipment = "cape" | "elytra";

const CapeDefaultAngle = (10.8 * Math.PI) / 180;

export class PlayerObject extends Group {
  public readonly skin: SkinObject;
  public readonly cape: CapeObject;
  public readonly elytra: ElytraObject;
  public readonly ears: EarsObject;

  public constructor() {
    super();

    this.skin = new SkinObject();
    this.skin.name = "skin";
    this.skin.position.y = 8;
    this.add(this.skin);

    this.cape = new CapeObject();
    this.cape.name = "cape";
    this.cape.position.y = 8;
    this.cape.position.z = -2;
    this.cape.rotation.x = CapeDefaultAngle;
    this.cape.rotation.y = Math.PI;
    this.add(this.cape);

    this.elytra = new ElytraObject();
    this.elytra.name = "elytra";
    this.elytra.position.y = 8;
    this.elytra.position.z = -2;
    this.elytra.visible = false;
    this.add(this.elytra);

    this.ears = new EarsObject();
    this.ears.name = "ears";
    this.ears.position.y = 10;
    this.ears.position.z = 2 / 3;
    this.ears.visible = false;
    this.skin.head.add(this.ears);
  }

  public get backEquipment(): BackEquipment | null {
    if (this.cape.visible) {
      return "cape";
    } else if (this.elytra.visible) {
      return "elytra";
    } else {
      return null;
    }
  }

  public set backEquipment(value: BackEquipment | null) {
    this.cape.visible = value === "cape";
    this.elytra.visible = value === "elytra";
  }

  public resetJoints(): void {
    this.skin.resetJoints();
    this.cape.rotation.x = CapeDefaultAngle;
    this.elytra.resetJoints();
  }
}
