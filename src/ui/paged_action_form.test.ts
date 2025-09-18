import { unitTestMap } from "../command/test";
import { Pages, PagedActionForm, PagedActionFormOptions } from "./paged_action_form";

const pages: Pages = {
  home: {
    title: "Home",
    body: "desc",
    buttons: [
      {
        label: "Button 1",
        pageId: "page2",
      },
      {
        label: "Button 2",
        onClick() {
          console.warn("CLICKED!");
        },
      },
      { label: "a", pageId: "a" },
    ],
  },
  page2: {
    title: "Page 2",
    body: "Something",
  },
  a: { title: "a", buttons: [{ label: "b", pageId: "b" }] },
  b: { title: "b", buttons: [{ label: "c", pageId: "c" }] },
  c: { title: "c", buttons: [{ label: "d", pageId: "d" }] },
  d: { title: "d", buttons: [{ label: "e", pageId: "e" }] },
  e: { title: "e" },
};

const options: PagedActionFormOptions = {
  back_button: {},
};

export default (units: unitTestMap) => {
  const ui = new PagedActionForm(pages);
  units.set("paged_action_form", (ctx, message) => {
    ui.showAll(undefined, options);
  });
};
