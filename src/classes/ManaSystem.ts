import { GameMode, Player } from "@minecraft/server";

export class ManaSystem {
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

  isManaEnough(manaRequired: number): boolean {
    let isAllowed: boolean = false;
    if (this.currentMana >= manaRequired || this.player.getGameMode() === GameMode.creative) {
      isAllowed = true
    }
    return isAllowed;
  }
}