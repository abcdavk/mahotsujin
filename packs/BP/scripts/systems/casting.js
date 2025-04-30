import { world, system } from "@minecraft/server";
import { magicWeapons } from "../constants/magicWeapons";
import { UserInterface } from "../ui/UserInterface";
world.afterEvents.itemStartUse.subscribe(({ itemStack, source: player }) => {
    if (!itemStack.hasTag("dave:item_cast_spell"))
        return;
    let weapon = magicWeapons.find((item) => item.id === itemStack.typeId);
    if (!weapon)
        return;
    let useCounter = 0;
    // Start counting use duration
    let runId = system.runInterval(() => {
        useCounter++;
        player.playAnimation("animation.magic_weapon.casting");
        if (useCounter < weapon.use_duration) {
            player.onScreenDisplay.setActionBar(`Use Duration: ${useCounter}`);
        }
        else {
            player.onScreenDisplay.setActionBar(`It's time to cast!!!`);
        }
    });
    // Setup itemStopUse once
    const stopUseHandler = world.afterEvents.itemStopUse.subscribe(({ itemStack: stoppedItemStack, source: stopPlayer }) => {
        if (stopPlayer.id !== player.id)
            return; // Make sure it's the same player
        if (!stoppedItemStack?.hasTag("dave:item_cast_spell"))
            return;
        // Stop counting
        system.clearRun(runId);
        if (useCounter >= weapon.use_duration) {
            // Casting success
            player.playAnimation("animation.magic_weapon.casting_done");
            player.onScreenDisplay.setActionBar(`Casting spell...`);
            new UserInterface(player).reduceMana(3);
        }
        else {
            // Casting failed
            player.playAnimation("animation.magic_weapon.casting_done");
            player.onScreenDisplay.setActionBar(`Casting canceled.`);
        }
        // Unsubscribe this event handler after first use
        world.afterEvents.itemStopUse.unsubscribe(stopUseHandler);
    });
});
