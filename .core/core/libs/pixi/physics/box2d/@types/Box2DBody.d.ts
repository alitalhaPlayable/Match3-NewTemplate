export declare class Box2DBody /*  extends Body */ {
  coreBody: any;
  label: string;

  /**
   * @param x - The x position of the body
   * @param y - The y position of the body
   * @param rotation - The rotation of the body
   * @param awake - Whether the body should be awake or not after setting the position (default is true)
   *  */
  setPosition(x: number, y: number, rotation?: number, awake?: boolean): void;
  setLinearVelocity(x: number, y: number): void;
  applyAngularImpulse(impulse: number): void;
  applyForce(
    force: { x: number; y: number },
    point: { x: number; y: number }
  ): void;
}
