import { TextDisplayHandler } from "./text_display";

class TextDisplay extends TextDisplayHandler {
  constructor() {
    super({ type: "lpsmods:text_display" });
  }
}

export default () => {
  new TextDisplay();
};
