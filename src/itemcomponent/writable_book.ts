import { CustomComponentParameters, EquipmentSlot, ItemComponentUseEvent, ItemStack, Player } from "@minecraft/server";
import { ActionForm, ActionFormEvent, ActionFormHandler } from "../ui/action_form";
import { ModalForm, ModalFormHandler } from "../ui/modal_form";
import { TextUtils } from "../text";
import { AddonUtils } from "../addon";
import { create, defaulted, number, object, Struct } from "superstruct";

export interface WritableBookOptions {
  max_pages: number;
}

export class WritableBookComponent {
  static readonly componentId = AddonUtils.makeId("writable_book");
  struct: Struct<any, any> = object({
    max_pages: defaulted(number(), 50),
  });

  /**
   * Writeable book item behavior.
   */
  constructor() {
    this.onUse = this.onUse.bind(this);
  }

  onUse(event: ItemComponentUseEvent, args: CustomComponentParameters): void {
    if (!event.itemStack) return;
    const options = create(args.params, this.struct) as WritableBookOptions;
    this.show(event.source, event.itemStack, 1, options);
  }

  saveItem(player: Player, itemStack: ItemStack): void {
    const equ = player.getComponent("equippable");
    if (!equ) return;
    equ.setEquipment(EquipmentSlot.Mainhand, itemStack);
  }

  // Set itemstack when updated.
  show(player: Player, itemStack: ItemStack, page: number, options: WritableBookOptions): void {
    const body = itemStack.getDynamicProperty(`mcutils:page_${page}`) as string;
    const maxPages = options.max_pages;
    const form: ActionForm = {
      title: {
        translate: "book.pageIndicator",
        with: {
          rawtext: [{ text: page.toString() }, { text: maxPages.toString() }],
        },
      },
      body: TextUtils.renderMarkdown(body ?? "*Page empty*") + "\n\n",
      buttons: [
        {
          label: "Previous Page",
          onClick: (event: ActionFormEvent) => {
            this.show(player, itemStack, page - 1, options);
          },
          condition: (event: ActionFormEvent) => page > 1,
        },
        {
          label: "Next Page",
          onClick: (event: ActionFormEvent) => {
            this.show(player, itemStack, page + 1, options);
          },
          condition: (event: ActionFormEvent) => page < maxPages,
        },
        {
          label: "Edit Page",
          onClick: (event: ActionFormEvent) => {
            const modal: ModalForm = {
              title: `Editing Page ${page}`,
              options: {
                content: { type: "text", label: "Content", value: body },
              },
              submitLabel: "#addExternalServerScreen.saveButtonLabel",
              onSubmit: (formEvent) => {
                itemStack.setDynamicProperty(`mcutils:page_${page}`, formEvent.formResult.content);
                this.saveItem(player, itemStack);
                this.show(player, itemStack, page, options);
              },
            };
            const edit = new ModalFormHandler(modal);
            edit.show(player);
          },
        },
      ],
    };
    const ui = new ActionFormHandler(form);
    ui.show(player);
  }
}
