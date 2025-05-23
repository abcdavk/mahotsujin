import { world, EntityComponentTypes, ItemStack } from "@minecraft/server";
import { customPotions } from "../constants/potions";
import { ManaSystem } from "../classes/ManaSystem";
world.afterEvents.itemCompleteUse.subscribe(({ itemStack, source: player, }) => {
    if (itemStack.hasTag("dave:potion")) {
        let potion = customPotions.find((item) => item.id === itemStack.typeId);
        let inv = player.getComponent(EntityComponentTypes.Inventory);
        let con = inv?.container;
        if (!potion || !inv || !con)
            return;
        con.setItem(player.selectedSlotIndex, new ItemStack("minecraft:glass_bottle"));
        let manaSystem = new ManaSystem(player).addMana(potion.mana_regen, potion.golden_mana);
    }
});
