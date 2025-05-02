import { world } from "@minecraft/server";
import { ManaSystem } from "../class/ManaSystem";

world.afterEvents.playerSpawn.subscribe(({ player }) => {
  let manaSystem = new ManaSystem(player).updateManaBar();

  if (player.hasTag("dave:magicman_setup")) return;
  player.setDynamicProperty("dave:currentMana", 10);
});