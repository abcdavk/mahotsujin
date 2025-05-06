import { world, system, EntityComponentTypes, EquipmentSlot } from "@minecraft/server";
import { magicWeapons } from "../constants/magicWeapons";
import { ManaSystem } from "../classes/ManaSystem";
import { spellsRegistry } from "../constants/spells";
import { CreateParticle } from "../classes/CreateParticle";
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
    let completeTick = weapon.use_duration + spellCastDuration;
    let runId = system.runInterval(() => {
        useCounter++;
        player.playAnimation("animation.magic_weapon.casting");
        let createParticle = new CreateParticle(player, dimension, spellSelected);
        let manaSystem = new ManaSystem(player);
        if (!manaSystem.isManaEnough(spellsRegistry[spellSelected].mana_usage) || player.isSneaking)
            return;
        player.runCommand('camerashake add @s 0.05 0.1 positional');
        createParticle.spawnByTick(useCounter, completeTick);
        if (useCounter < completeTick) {
            player.onScreenDisplay.setActionBar(`Use Duration: ${useCounter}`);
        }
        else {
            createParticle.spawnLastTick();
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
        let manaSystem = new ManaSystem(player);
        if (useCounter >= completeTick) {
            player.playAnimation("animation.magic_weapon.casting_done");
            player.onScreenDisplay.setActionBar(`Casting spell...`);
            if (!manaSystem.isManaEnough(spellsRegistry[spellSelected].mana_usage) || player.isSneaking)
                return;
            // Casting success
            if (spellSelected !== undefined) {
                spellsRegistry[spellSelected].execute(player, dimension);
            }
            manaSystem.reduceMana(spellsRegistry[spellSelected].mana_usage);
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
