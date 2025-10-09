import { ItemEvents } from "./item";

export default () => {
  ItemEvents.playerHold.subscribe((event) => {
    console.warn("HELD ITEM");
  });
  ItemEvents.playerReleaseHold.subscribe((event) => {
    console.warn("RELEASE HELD ITEM");
  });
  ItemEvents.playerHoldTick.subscribe((event) => {
    event.player.onScreenDisplay.setActionBar("TICK ITEM");
  });

  //   ItemEvents.playerStripped.subscribe((event) => {
  //     console.warn("STRIPPED");
  //   });

  //   ItemEvents.playerScrapedWax.subscribe((event) => {
  //     console.warn("SCRAPED WAX");
  //   });

  //   ItemEvents.playerScrapedOxidization.subscribe((event) => {
  //     console.warn("SCRAPED OXIDIZATION");
  //   });
};
