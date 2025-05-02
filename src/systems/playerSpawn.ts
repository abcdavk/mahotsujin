import { world } from "@minecraft/server";
import { UserInterface } from "../class/UserInterface";

world.afterEvents.playerSpawn.subscribe(({ player }) => {
  let playerUI = new UserInterface(player).updateManaBar();

  if (player.hasTag("dave:magicman_setup")) return;
  player.setDynamicProperty("dave:currentMana", 10);
});