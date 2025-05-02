import { world, system, EntityComponentTypes, EquipmentSlot } from "@minecraft/server";
import { magicWeapons } from "../constants/magicWeapons";
import { UserInterface } from "../class/UserInterface";
import { spellsRegistry } from "../constants/spells";
import { CreateParticle } from "../class/CreateParticle";
world.afterEvents.itemStartUse.subscribe(({ itemStack, source: player }) => {
    if (!itemStack.hasTag("dave:item_cast_spell"))
        return;
    let weapon = magicWeapons.find((item) => item.id === itemStack.typeId);
    if (!weapon)
        return;
    let useCounter = 0;
    let dimension = world.getDimension(player.dimension.id);
    let equippable = player.getComponent(EntityComponentTypes.Equippable);
    let offhandItem = equippable?.getEquipment(EquipmentSlot.Offhand);
    let spellOnItem = offhandItem?.getDynamicProperty("dave:spell_binding");
    let spellSelected = spellOnItem ? JSON.parse(spellOnItem)[offhandItem?.getDynamicProperty("dave:spell_selected")] : undefined;
    let spellCastDuration = spellSelected !== undefined ? spellsRegistry[spellSelected].casting_speed : 0;
    // Start counting use duration
    let runId = system.runInterval(() => {
        useCounter++;
        let completeTick = weapon.use_duration + spellCastDuration;
        new CreateParticle(player, dimension, spellSelected).spawnByTick(useCounter, completeTick);
        player.runCommand('camerashake add @s 0.05 0.1 positional');
        player.playAnimation("animation.magic_weapon.casting");
        if (useCounter < completeTick) {
            // ==== Endpoint- undetetected
            player.onScreenDisplay.setActionBar(`Use Duration: ${useCounter}`);
        }
        else {
            new CreateParticle(player, dimension, spellSelected).spawnLastTick();
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
            if (spellSelected !== undefined) {
                spellsRegistry[spellSelected].execute(player, dimension);
            }
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
