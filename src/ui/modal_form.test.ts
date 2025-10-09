import { CustomCommandOrigin } from "@minecraft/server";
import { ModalForm, ModalFormHandler, ModalFormOnSubmit } from "./modal_form";
import { UnitTestMap } from "../command/test";

const modalForm: ModalForm = {
  title: "TITLE",
  options: {
    text: { type: "text", label: "TEXT" },
    dropdown: {
      type: "dropdown",
      label: "DROPDOWN",
      options: ["OPTION 1", "OPTION 2", "OPTION 3"],
    },
    slider: { type: "slider", label: "SLIDER" },
    toggle: { type: "toggle", label: "TOGGLE" },
  },
  onSubmit: (event: ModalFormOnSubmit) => {
    console.warn(JSON.stringify(event.formResult));
  },
};

export default (units: UnitTestMap) => {
  const ui = new ModalFormHandler(modalForm);
  units.set("modal_form", (ctx: CustomCommandOrigin) => {
    ui.showAll({ test: "hello, world!" });
  });
};
