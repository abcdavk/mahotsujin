import {
	EntityComponentTypes,
  EquipmentSlot,
  ItemComponentTypes,
  ItemStack,
  Player,
  system,
  TicksPerSecond,
  world,
} from "@minecraft/server";

const magicWeapons = [
  {
    id: "dave:wand",
    mana_efficiency: false,
    use_duration: 0.5 * TicksPerSecond,
    range_level: 16,
  },
  {
    id: "dave:lapis_wand",
    mana_efficiency: true,
    use_duration: 0.5 * TicksPerSecond,
    range_level: 16,
  },
  {
    id: "dave:amethyst_wand",
    mana_efficiency: false,
    use_duration: 1.0 * TicksPerSecond,
    range_level: 24,
  },
  {
    id: "dave:redstone_wand",
    mana_efficiency: false,
    use_duration: 0.5 * TicksPerSecond,
    range_level: 16,
  },

  {
    id: "dave:staff",
    mana_efficiency: false,
    use_duration: 2.0 * TicksPerSecond,
    range_level: 24,
  },
  {
    id: "dave:lapis_staff",
    mana_efficiency: true,
    use_duration: 2.0 * TicksPerSecond,
    range_level: 24,
  },
  {
    id: "dave:amethyst_staff",
    mana_efficiency: false,
    use_duration: 3.0 * TicksPerSecond,
    range_level: 32,
  },
  {
    id: "dave:redstone_staff",
    mana_efficiency: false,
    use_duration: 2.0 * TicksPerSecond,
    range_level: 24,
  },
];

var Unicode = {
  fire: "",
  thunder: "",
  wind: "",
  ice: ""
}

const spellsRegistry = [
	{
		id: "fire:fire_ball",
		name: `${Unicode.fire} Fire Ball`,
		damage: 5,
		range: 8,
		holdable: false,
		mana_usage: 2,
		area_effect: 4,
		crowd_controll: false,
		casting_speed: 1.0 * TicksPerSecond,
	},
	{
		id: "fire:fire_breath",
		name: `${Unicode.fire} Fire Breath`,
		damage: 5,
		range: 4,
		holdable: true,
		mana_usage: 0.5,
		area_effect: 4,
		crowd_controll: false,
		casting_speed: 0.5 * TicksPerSecond,
	},
	{
		id: "fire:blast_vortex",
		name: `${Unicode.fire} Blast Vortex`,
		damage: 3,
		range: 4,
		holdable: false,
		mana_usage: 2,
		area_effect: 4,
		crowd_controll: true,
		casting_speed: 1.0 * TicksPerSecond,
	},
];

world.afterEvents.itemStartUse.subscribe(({ itemStack, source: player }) => {
  if (!itemStack.hasTag("dave:item_cast_spell")) return;

  let weapon = magicWeapons.find((item) => item.id === itemStack.typeId);
  if (!weapon) return;

  let useCounter = 0;

  // Start counting use duration
  let runId = system.runInterval(() => {
    useCounter++;
    player.playAnimation("animation.magic_weapon.casting");
    if (useCounter < weapon.use_duration) {
      player.onScreenDisplay.setActionBar(`Use Duration: ${useCounter}`);
    } else {
      player.onScreenDisplay.setActionBar(`It's time to cast!!!`);
    }
  });

  // Setup itemStopUse once
  const stopUseHandler = world.afterEvents.itemStopUse.subscribe(
    ({ itemStack: stoppedItemStack, source: stopPlayer }) => {
      if (stopPlayer.id !== player.id) return; // Make sure it's the same player
      if (!stoppedItemStack?.hasTag("dave:item_cast_spell")) return;

      // Stop counting
      system.clearRun(runId);

      if (useCounter >= weapon.use_duration) {
        // Casting success
        player.playAnimation("animation.magic_weapon.casting_done");
        player.onScreenDisplay.setActionBar(`Casting spell...`);
        new UserInterface(player).reduceMana(3);
      } else {
        // Casting failed
        player.playAnimation("animation.magic_weapon.casting_done");
        player.onScreenDisplay.setActionBar(`Casting canceled.`);
      }

      // Unsubscribe this event handler after first use
      world.afterEvents.itemStopUse.unsubscribe(stopUseHandler);
    }
  );
});

world.afterEvents.playerSpawn.subscribe(({ player }) => {
  let playerUI = new UserInterface(player).updateManaBar();

  if (player.hasTag("dave:magicman_setup")) return;
  player.setDynamicProperty("dave:currentMana", 10);
});

export class UserInterface {
  private player: Player;
  private currentMana: number;

  constructor(player: Player) {
    this.player = player;
    this.currentMana = (player.getDynamicProperty("dave:currentMana") as number) ?? 0;
  }

  reduceMana(amount: number) {
    this.currentMana -= amount;
    if (this.currentMana < 0) this.currentMana = 0;
    this.player.setDynamicProperty("dave:currentMana", this.currentMana);

    this.updateManaBar();
  }
	addMana(amount: number, isGoldenMana: boolean) {
		const wasGoldenMana = this.currentMana > 10;
		if (wasGoldenMana && !isGoldenMana) {
			return;
		}
		this.currentMana += amount;
	
		if (wasGoldenMana || isGoldenMana) {
			if (this.currentMana > 20) this.currentMana = 20;
		} else {
			if (this.currentMana > 10) this.currentMana = 10;
		}
	
		this.player.setDynamicProperty("dave:currentMana", this.currentMana);
		this.updateManaBar();
	}
	
  updateManaBar() {
    let nx = Math.ceil(this.currentMana / 10);
    let pv = nx - 1;

    if (nx > 2) nx = 2;
    if (pv > 1) pv = 1;
    if (nx < 1) nx = 1;
    if (pv < 0) pv = 0;

    let maxOfCurrentLayer = nx * 10;
    let mn = maxOfCurrentLayer - this.currentMana;

    if (mn > 9) mn = 9;
    if (mn < 0) mn = 0;
    this.player.onScreenDisplay.setTitle(
      `Mn:${mn.toString().padStart(2, "0")};Nx:${nx};Pv:${pv}`
    );
  }
}

const customPotions = [
	{
		id: "dave:mana_potion",
		mana_regen: 3,
		golden_mana: false
	},
	{
		id: "dave:golden_mana_potion",
		mana_regen: 12,
		golden_mana: true
	}
]

world.afterEvents.itemCompleteUse.subscribe(({
	itemStack,
	source: player,
}) => {
	if (itemStack.hasTag("dave:potion")) {
		let potion = customPotions.find((item) => item.id === itemStack.typeId);
		let inv = player.getComponent(EntityComponentTypes.Inventory);
		let con = inv?.container
  	if (!potion || !inv || !con) return;
		con.setItem(player.selectedSlotIndex, new ItemStack("minecraft:glass_bottle"));
		let playerUI = new UserInterface(player).addMana(potion.mana_regen, potion.golden_mana);
	}
});

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

      itemHand.setLore([
        `§r§7Spells: (1/${spellBook.max_spells})`,
        `§r§7 - ${spellAtributes.name}`
      ]);

		  con.setItem(player.selectedSlotIndex, itemHand);
    }
	}
});


// let {
// 	name
// } = spell;
// itemHand.setLore([
// 	`§r§7Spells: (1/1)`,
// 	`§r§7 - ${name}`
// ]);
// itemHand.setDynamicProperty("dave:magic_id", message);
// con.setItem(player.selectedSlotIndex, itemHand);
//  <- cool fire icon 