import { ScreenEvents } from "./screen";

export default () => {
  ScreenEvents.openScreen.subscribe((event) => {
    console.warn(`OPEN ${event.screenType}`);
  });
  ScreenEvents.closeScreen.subscribe((event) => {
    console.warn(`CLOSE ${event.screenType}`);
  });
};
