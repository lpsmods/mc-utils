import { system, ItemComponentUseEvent, CustomComponentParameters, RawMessage } from "@minecraft/server";
import { ItemBaseComponent } from "./base";
import { AddonUtils } from "../addon";
import { boolean, create, defaulted, number, object, optional, string, Struct } from "superstruct";
import {
  CustomPage,
  PagedActionForm,
  PagedActionFormEvent,
  PagedActionFormOptions,
  Pages,
} from "../ui/paged_action_form";
import { Identifier } from "../identifier";

export interface InfoBookOptions extends PagedActionFormOptions {
  default: string;
  translation_pattern: string;
}

export class InfoBookComponent extends ItemBaseComponent {
  static readonly componentId = AddonUtils.makeId("info_book");
  struct: Struct<any, any> = object({
    developer_mode: defaulted(boolean(), false),
    default: defaulted(string(), "home"),
    translation_pattern: defaulted(string(), "guide.{NAMESPACE}:{KEY}"),
    back_button: optional(
      object({
        label: optional(string()),
        icon: optional(string()),
        top_margin: optional(number()),
        bottom_margin: optional(number()),
        bottom_divider: defaulted(boolean(), false),
        top_divider: defaulted(boolean(), false),
      }),
    ),
    "mcutils:search": optional(
      object({
        include_buttons: defaulted(boolean(), false),
        include_titles: defaulted(boolean(), false),
        title: optional(string()),
        body: optional(string()),
        include_titles_label: optional(string()),
        include_buttons_label: optional(string()),
        result_title: optional(string()),
        result_body: optional(string()),
      }),
    ),
  });

  customPages = new Map<string, CustomPage>();
  ui: PagedActionForm;

  /**
   * A simple UI guide book for add-ons.
   */
  constructor(pages?: Pages) {
    super();
    this.ui = new PagedActionForm(pages, InfoBookComponent.componentId);
    this.ui.t = this.t;
    this.onUse = this.onUse.bind(this);
  }

  t(event: PagedActionFormEvent, key: string | RawMessage): string | RawMessage {
    const options = event.options as InfoBookOptions;
    if (typeof key !== "string") return key;
    if (key.charAt(0) == "#") {
      const namespace = Identifier.parse(event?.ctx?.itemId ?? InfoBookComponent.componentId).namespace;
      return (
        "#" +
        (options.translation_pattern)
          .replace("{NAMESPACE}", namespace)
          .replace("{KEY}", key.slice(1))
      );
    }
    return key;
  }

  // EVENTS

  onUse(event: ItemComponentUseEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as InfoBookOptions;
    if (options.developer_mode) {
      this.ui.validatePage(options.default);
    }
    system.run(() => {
      if (!event.itemStack) return;
      this.ui.clearHistory(event.source);
      this.ui.show(event.source, undefined, options, { itemId: event.itemStack.typeId });
    });
  }
}
