import { world, system, Player, EntityComponentTypes, EquipmentSlot } from "@minecraft/server";
import { spellsRegistry } from "../constants/spells";

const spellBooks = [
  {
    id: "dave:magic_book",
    max_spells: 2,
    mana_efficiency: true,
  },
  {
    id: "dave:magic_ledger",
    max_spells: 4,
    mana_efficiency: false,
  }
];

world.afterEvents.itemUse.subscribe(({
  source: player,
  itemStack
}) => {
  let equippable = player.getComponent(EntityComponentTypes.Equippable);
  let offhandItem = equippable?.getEquipment(EquipmentSlot.Offhand);

  if (itemStack.hasTag("dave:spell_book")) {
    if (!offhandItem) {
      equippable?.setEquipment(EquipmentSlot.Offhand, itemStack);
      equippable?.setEquipment(EquipmentSlot.Mainhand, undefined);
    } else {
      equippable?.setEquipment(EquipmentSlot.Mainhand, offhandItem);
      equippable?.setEquipment(EquipmentSlot.Offhand, itemStack)
    }
  }
});

system.afterEvents.scriptEventReceive.subscribe(({
	sourceEntity,
	message,
	id
}) => {
	if (sourceEntity?.typeId !== "minecraft:player") return;
	let player = sourceEntity as Player;
	let inv = player.getComponent(EntityComponentTypes.Inventory);
	let con = inv?.container;
	let itemHand = con?.getItem(player.selectedSlotIndex);
	if (inv && con && itemHand && id === 'dave:add_magic') {
		if (!itemHand.hasTag("dave:spell_book")) return;
    let spellBook = spellBooks.find((item) => item.id === itemHand.typeId);
    if (!spellBook) return;
    
		let spellAtributes = spellsRegistry[parseInt(message)];
    let spellOnItem = itemHand.getDynamicProperty("dave:spell_binding") as string;
    if (spellOnItem) {
      let spellArray: number[] = JSON.parse(spellOnItem);
      if (spellArray.length+1 > spellBook.max_spells) return;
      spellArray.push(parseInt(message));

      let itemLores: string[] = [`§r§7Spells: (${spellArray.length}/${spellBook.max_spells})`]

      spellArray.forEach(spell => {
        itemLores.push(`§r§7 - ${spellsRegistry[spell].name}`)
      })

      itemHand.setLore(itemLores);
      // itemHand.setDynamicProperty("dave:spell_count", spellCount + 1)
      itemHand.setDynamicProperty("dave:spell_binding", JSON.stringify(spellArray));

      con.setItem(player.selectedSlotIndex, itemHand);
    } else {
      let selectedSpell = JSON.stringify([parseInt(message)]);
      itemHand.setDynamicProperty("dave:spell_binding", selectedSpell);
      itemHand.setDynamicProperty("dave:spell_selected", 0)
      itemHand.setLore([
        `§r§7Spells: (1/${spellBook.max_spells})`,
        `§r§7 - ${spellAtributes.name}`
      ]);

		  con.setItem(player.selectedSlotIndex, itemHand);
    }
	}
});