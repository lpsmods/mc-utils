import {
  system,
  ItemComponentUseEvent,
  Player,
  CustomComponentParameters,
  ItemStack,
  RawMessage,
} from "@minecraft/server";
import { deepCopy } from "../utils";
import { ActionButton, ActionForm, ActionFormEvent, ActionFormHandler } from "../ui/ActionForm";
import { ModalForm, ModalFormOnSubmit, ModalFormHandler, FormResult } from "../ui/ModalForm";
import { CustomItemEvent, ItemBaseComponent } from "./ItemBase";
import { Identifier } from "../misc/Identifier";
import { TextUtils } from "../TextUtils";
import { ValidationError, ValidationIssue } from "../error";

export interface PageButton extends ActionButton {
  pageId?: string;
}

export interface PageData {
  title?: string | RawMessage;
  body?: string | RawMessage;

  /**
   * Function to call when the UI is shown.
   * @param {ActionFormEvent} event
   */
  onShow?: (event: ActionFormEvent) => void;

  /**
   * Function to call when the UI is closed or switched to a new menu.
   * @param {ActionFormEvent} event
   */
  onClose?: (event: ActionFormEvent) => void;

  icon?: string;

  /**
   * An array of buttons.
   */
  buttons?: PageButton[] | string[];

  /**
   * Hide this page.
   */
  hidden?: boolean;

  /**
   * Terms/tags for SEO.
   */
  keywords?: string[];
}

export interface SearchOptions {
  include_buttons?: boolean;
  include_titles?: boolean;
  title?: string;
  body?: string;
  include_titles_label?: string;
  include_buttons_label?: string;
  result_title?: string;
  result_body?: string;
}

export interface BackButtonOptions {
  label?: string;
  icon?: string;
  top_margin?: number;
  bottom_margin?: number;
  top_divider?: boolean;
  bottom_divider?: boolean;
}

export interface InfoBookOptions {
  /**
   * When true it will validate the form when opened.
   */
  developer_mode?: boolean;

  /**
   * The starting page id.
   */
  default?: string;

  /**
   * Pattern for translation keys. Defaults to "guide.{NAMESPACE}:{KEY}"
   */
  translation_pattern?: string;

  /**
   * When defined it will add a "back" button to all sub pages.
   */
  back_button?: BackButtonOptions;

  /**
   * Options for search engine.
   */
  "mcutils:search"?: SearchOptions;
}

export type Pages = { [key: string]: PageData };

export class InfoBookEvent {
  constructor(
    ctx: InfoBookComponent,
    player: Player,
    itemStack: ItemStack,
    pageId: string,
    pages: Pages,
    options: InfoBookOptions
  ) {
    this.ctx = ctx;
    this.player = player;
    this.itemStack = itemStack;
    this.pages = pages;
    this.pageId = pageId;
    this.options = options;
  }

  readonly ctx: InfoBookComponent;
  readonly player: Player;
  readonly itemStack: ItemStack;
  readonly pages: Pages;
  readonly pageId: string;
  readonly options: InfoBookOptions;

  static withPage(event: InfoBookEvent, pageId: string | undefined): InfoBookEvent {
    return new InfoBookEvent(
      event.ctx,
      event.player,
      event.itemStack,
      pageId ?? event.options.default ?? "home",
      event.pages,
      event.options
    );
  }

  /**
   * Context for ActionFormEvent
   * @returns {any}
   */
  getContext(): any {
    return {
      itemStack: this.itemStack,
      pageId: this.pageId,
      pages: this.pages,
      options: this.options,
    };
  }
}

export abstract class CustomPage {
  abstract getButton(event: InfoBookEvent): ActionButton;
  abstract show(event: InfoBookEvent): void;
}

/**
 * Custom page for searching the book.
 */
export class SearchPage extends CustomPage {
  static typeId = "mcutils:search";
  ctx?: InfoBookComponent;
  options: SearchOptions = {};

  #f(text: string): string {
    return text.toLowerCase().replace(/[_]/g, " ");
  }

  search(data: FormResult): PageButton[] {
    const q = data.query?.toString().toLowerCase();
    if (!q) return [];
    const results = [];

    const pages = this.ctx?.pages;

    for (const pageId in pages) {
      const page = deepCopy(pages[pageId]);
      if (page.hidden != undefined && page.hidden) continue;

      if (page.body && page.body.toString().toLowerCase().includes(q)) {
        results.push({ label: TextUtils.highlightQuery(q, page.body.toString()), pageId: pageId });
      }

      if (data.include_titles && page.title) {
        if (this.#f(page.title.toString()).includes(q)) {
          results.push({
            label: TextUtils.highlightQuery(q, page.title.toString()),
            pageId: pageId,
          });
        }
      }

      if (data.include_buttons && page.buttons) {
        for (const btn of page.buttons) {
          if (typeof btn === "string") continue;
          if (this.#f(btn.label.toString()).includes(q)) {
            btn.label = TextUtils.highlightQuery(q, btn.label.toString());
            results.push(btn);
          }
        }
      }
    }

    return results;
  }

  #searchResultsPage(event: InfoBookEvent, formEvent: ModalFormOnSubmit): void {
    const result = formEvent.formResult;
    const namespace = Identifier.parse(event.itemStack).namespace;
    const buttons = this.search(result);
    const btns: ActionButton[] = buttons;
    for (let i = 0; i < buttons.length; i++) {
      btns[i].onClick = () => {
        const showEvent = InfoBookEvent.withPage(event, buttons[i].pageId);
        this.ctx?.show(showEvent);
      };
    }
    const form: ActionForm = {
      title: this.options.result_title ?? `#guide.${namespace}:search.results`,
      body: (this.options.result_body ?? `Results for "{QUERY}"`).replace(
        "{QUERY}",
        result.query as string
      ),
      buttons: buttons,
    };
    const ui = new ActionFormHandler(form);
    ui.show(event.player);
  }

  #searchPage(event: InfoBookEvent): void {
    const form: ModalForm = {
      title: event.ctx.t(event, this.options.title ?? "#search"),
      options: {
        query: { type: "text", label: event.ctx.t(event, this.options.body ?? "#search.desc") },
        include_titles: {
          type: "toggle",
          label: event.ctx.t(event, this.options.include_titles_label ?? "#search.include_titles"),
          condition: () => this.options.include_titles ?? true,
        },
        include_buttons: {
          type: "toggle",
          label: event.ctx.t(
            event,
            this.options.include_buttons_label ?? "#search.include_buttons"
          ),
          condition: () => this.options.include_buttons ?? true,
        },
      },
      submitLabel: `controller.buttonTip.enterSearch`,
      onSubmit: (formEvent) => {
        this.#searchResultsPage(event, formEvent);
      },
    };
    const ui = new ModalFormHandler(form);
    ui.show(event.player);
  }

  getButton(event: InfoBookEvent): PageButton {
    return {
      label: "controller.buttonTip.enterSearch",
      icon: "textures/ui/magnifyingGlass.png",
      onClick: (clickEvent) => {
        this.show(event);
      },
    };
  }

  show(event: InfoBookEvent): void {
    this.options = event.options["mcutils:search"] ?? {};
    this.#searchPage(event);
  }
}

export class InfoBookComponent extends ItemBaseComponent {
  pages: Pages;
  customPages = new Map<string, CustomPage>();

  /**
   * A simple UI guide book for add-ons.
   */
  constructor(pages?: Pages) {
    super();
    this.pages = pages ?? {};
    this.customPages.set(SearchPage.typeId, new SearchPage());
    this.onUse = this.onUse.bind(this);
  }

  customPage(identifier: string, page: CustomPage): InfoBookComponent {
    this.customPages.set(identifier, page);
    return this;
  }

  t(event: InfoBookEvent, key: string | RawMessage): string | RawMessage {
    if (typeof key !== "string") return key;
    if (key.charAt(0) == "#") {
      const namespace = Identifier.parse(event.itemStack.typeId).namespace;
      return (
        "#" +
        (event.options.translation_pattern ?? "guide.{NAMESPACE}:{KEY}")
          .replace("{NAMESPACE}", namespace)
          .replace("{KEY}", key.slice(1))
      );
    }
    return key;
  }

  #titleKey(event: InfoBookEvent): string {
    return `#item.${event.itemStack.typeId}`;
  }

  #convert(page: PageData, event: InfoBookEvent): ActionForm {
    const form = page as ActionForm;
    if (!page.title) {
      form.title = this.#titleKey(event);
    } else {
      form.title = this.t(event, page.title);
    }

    if (page.body) {
      form.body = this.t(event, page.body);
    }

    if (page.buttons && form.buttons) {
      for (let i = 0; i < page.buttons.length; i++) {
        let btn = page.buttons[i];

        // Ref page.
        if (typeof btn === "string") {
          const page = event.pages[btn];
          const customPage = this.customPages.get(btn);
          if (customPage) {
            form.buttons[i] = customPage.getButton(event);
            continue;
          }
          form.buttons[i] = { label: "UNKNOWN" };
          if (!page) {
            console.warn(`Page not found for "${btn}"`);
            continue;
          }

          form.buttons[i].icon = page.icon;
          btn = { label: page.title ?? this.#titleKey(event), pageId: btn };
        }

        form.buttons[i].label = this.t(event, btn.label);

        if (!btn.pageId) continue;

        form.buttons[i].onClick = (w: ActionFormEvent) => {
          const showEvent = InfoBookEvent.withPage(event, btn.pageId);
          this.show(showEvent);
        };
      }
    }

    return form;
  }

  isDefault(event: InfoBookEvent): boolean {
    return (event.options.default ?? "home") === event.pageId;
  }

  getHistory(event: InfoBookEvent): string[] {
    return (
      JSON.parse(event.player.getDynamicProperty(event.itemStack.typeId + ".history") as string) ??
      []
    );
  }

  setHistory(event: InfoBookEvent, history: string[]) {
    event.player.setDynamicProperty(event.itemStack.typeId + ".history", JSON.stringify(history));
  }

  isPageValid(pageId: string): boolean {
    try {
      this.validatePage(pageId);
      return true;
    } catch (e) {}
    return false;
  }

  hasPage(pageId: string) {
    return this.customPages.has(pageId) || this.pages[pageId] !== undefined
  }

  validatePage(pageId: string, ignorePages: string[] = []): void {
    if (this.customPages.has(pageId)) return;
    const page = this.pages[pageId];
    const errors: ValidationIssue[] = [];

    ValidationError.optionalValueError(errors, `${pageId}.title`, page.title, ["string"]);
    ValidationError.optionalValueError(errors, `${pageId}.body`, page.body, ["string"]);
    ValidationError.optionalValueError(errors, `${pageId}.icon`, page.icon, ["string"]);
    ValidationError.optionalValueError(errors, `${pageId}.hidden`, page.hidden, ["boolean"]);
    ValidationError.optionalValueError(errors, `${pageId}.onShow`, page.onShow, ["function"]);
    ValidationError.optionalValueError(errors, `${pageId}.onClose`, page.onClose, ["function"]);

    // TODO: Check if array first.
    if (page.keywords) {
      for (let i = 0; i < page.keywords.length; i++) {
        const keyword = page.keywords[i];
        ValidationError.valueError(errors, `${pageId}.keywords[${i}]`, keyword, ["string"]);
      }
    }

    // TODO: Check if array first.
    if (page.buttons) {
      for (let i = 0; i < page.buttons.length; i++) {
        const button = page.buttons[i];
        const bool = ValidationError.valueError(errors, `${pageId}.buttons[${i}]`, button, ["string", "object"]);
        if (!bool) continue;
      
        if (typeof button === "string") {
          if (ignorePages.includes(button)) continue;
          if (!this.hasPage(button)) {
            errors.push({path: `${pageId}.buttons[${i}]`, message: `Page "${ button }" does not exist.`});
            continue;
          }
          ignorePages.push(button);
          this.validatePage(button, ignorePages);
          continue;
        }
        if (typeof button === "object") {
          ValidationError.valueError(errors, `${pageId}.buttons[${i}].label`, button.label, ["string"]);
          ValidationError.optionalValueError(errors, `${pageId}.buttons[${i}].icon`, button.icon, ["string"]);
          ValidationError.optionalValueError(errors, `${pageId}.buttons[${i}].pageId`, button.pageId, ["string"]);
          ValidationError.optionalValueError(errors, `${pageId}.buttons[${i}].top_margin`, button.top_margin, ["number"]);
          ValidationError.optionalValueError(errors, `${pageId}.buttons[${i}].bottom_margin`, button.bottom_margin, ["number"]);
          ValidationError.optionalValueError(errors, `${pageId}.buttons[${i}].top_divider`, button.top_divider, ["boolean"]);
          ValidationError.optionalValueError(errors, `${pageId}.buttons[${i}].bottom_divider`, button.bottom_divider, ["boolean"]);
          ValidationError.optionalValueError(errors, `${pageId}.buttons[${i}].onClick`, button.onClick, ["function"]);
          ValidationError.optionalValueError(errors, `${pageId}.buttons[${i}].condition`, button.condition, ["function"]);
          
          if (button.pageId && !ignorePages.includes(button.pageId)) {
            if (!this.hasPage(button.pageId)) {
              errors.push({path: `${pageId}.buttons[${i}].pageId`, message: `Page "${ button.pageId }" does not exist.`});
              continue;
            }
            ignorePages.push(button.pageId);
            this.validatePage(button.pageId, ignorePages);
          }
        }
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors).toString();
    }
  }

  /**
   * Show a page.
   */
  show(event: InfoBookEvent): void {
    const history = this.getHistory(event);
    history.push(event.pageId);
    this.setHistory(event, history);
    if (this.customPages.has(event.pageId)) return this.customPages.get(event.pageId)?.show(event);

    // TODO: Does'nt copy over funcs.
    const page = deepCopy(this.pages[event.pageId]);
    // const page = this.pages[event.pageId];
    const ctx = event.getContext();
    const form = this.#convert(page, event);

    // Add back button.
    if (event.options.back_button != undefined && !this.isDefault(event)) {
      if (!form.buttons) form.buttons = [];
      form.buttons.push({
        label: event.options.back_button.label ?? "#gui.back",
        icon: event.options.back_button.icon,
        top_margin: event.options.back_button.top_margin ?? 1,
        bottom_margin: event.options.back_button.bottom_margin,
        top_divider: event.options.back_button.top_divider ?? true,
        bottom_divider: event.options.back_button.bottom_divider,
        onClick: () => {
          const end = history.length - 2;
          const page = history[end];
          history.splice(end, 2);
          this.setHistory(event, history);
          const showEvent = InfoBookEvent.withPage(event, page);
          this.show(showEvent);
        },
      });
    }

    // Add back button.
    const ui = new ActionFormHandler(form);
    ui.show(event.player, ctx);
  }

  // EVENTS

  onUse(event: ItemComponentUseEvent, args: CustomComponentParameters): void {
    const options = args.params as InfoBookOptions;
    if (options.developer_mode) {
      this.validatePage(options.default ?? "home");
    }
    system.run(() => {
      if (!event.itemStack) return;
      const showEvent = new InfoBookEvent(
        this,
        event.source,
        event.itemStack,
        options.default ?? "home",
        this.pages,
        options
      );
      this.setHistory(showEvent, []);
      this.show(showEvent);
    });
  }
}
