import { Player, PlayerInteractWithEntityAfterEvent } from "@minecraft/server";
import { EntityDismountEvent, EntityMountEvent } from "../event";
import { EntityHandler } from "./entity_handler";

class BoatEntity extends EntityHandler {
  constructor() {
    super({ type: "boat" });
    this.onMount = this.onMount.bind(this);
    this.onDismount = this.onDismount.bind(this);
    this.onInteract = this.onInteract.bind(this);
  }
  onMount(event: EntityMountEvent): void {
    if (!(event.rider instanceof Player)) return;
    event.rider.sendMessage("ENTER boat");
  }
  onDismount(event: EntityDismountEvent): void {
    if (!(event.rider instanceof Player)) return;
    event.rider.sendMessage("EXIT boat");
  }

  onInteract(event: PlayerInteractWithEntityAfterEvent): void {
    // Send packet
    // const buf = new PacketData();
    // buf.writeEntity(event.player);
    // const block = event.player.dimension.getBlock(event.player.location);
    // buf.writeBlockPermutation(block.permutation);
    // buf.writeBlock(block)
    // buf.writeNumber(10000);
    // buf.writeNumber(3.14159);
    // buf.writeNumberArray([0,1,2,3,4]);
    // buf.writeString('Hello, World!');
    // buf.writeDate(new Date('05/15/2002'));
    // Packet.send("mcutils:interact_boat", buf);
    console.warn("INTERACT!");
  }
}

class MinecartEntity extends EntityHandler {
  constructor() {
    super({ type: "minecart" });
    this.onMount = this.onMount.bind(this);
    this.onDismount = this.onDismount.bind(this);
  }
  onMount(event: EntityMountEvent): void {
    if (!(event.rider instanceof Player)) return;
    event.rider.sendMessage("ENTER minecart");
  }
  onDismount(event: EntityDismountEvent): void {
    if (!(event.rider instanceof Player)) return;
    event.rider.sendMessage("EXIT minecart");
  }
}

export default () => {
  new BoatEntity();
  new MinecartEntity();
};
