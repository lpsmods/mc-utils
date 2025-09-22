import { Player, RawMessage, world } from "@minecraft/server";
import { ActionButton, ActionForm, ActionFormEvent, ActionFormHandler } from "./action_form";
import { deepCopy } from "../utils";
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
  buttons?: (PageButton | string)[];

  /**
   * Hide this page.
   */
  hidden?: boolean;

  /**
   * Terms/tags for SEO.
   */
  keywords?: string[];
}

export interface BackButtonOptions {
  label?: string;
  icon?: string;
  top_margin?: number;
  bottom_margin?: number;
  top_divider?: boolean;
  bottom_divider?: boolean;
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

export interface PagedActionFormOptions {
  /**
   * When true it will validate the form when opened.
   */
  developer_mode?: boolean;

  /**
   * The starting page id.
   */
  default?: string;

  /**
   * When defined it will add a "back" button to all sub pages.
   */
  back_button?: BackButtonOptions;

  "mcutils:search"?: SearchOptions;
}

export type Pages = { [key: string]: PageData };

export class PagedActionFormEvent {
  constructor(player: Player, pages: Pages, pageId?: string, options?: PagedActionFormOptions, ctx?: any) {
    this.player = player;
    this.pages = pages;
    this.ctx = ctx;
    this.options = options ?? { default: "home" };
    this.pageId = pageId ?? options?.default ?? "home";
  }

  readonly player: Player;
  readonly pages: Pages;
  readonly pageId: string;
  readonly options: PagedActionFormOptions;
  readonly ctx?: any;

  static withPage(event: PagedActionFormEvent, pageId?: string): PagedActionFormEvent {
    return new PagedActionFormEvent(event.player, event.pages, pageId, event.options);
  }

  /**
   * Context for ActionFormEvent
   * @returns {any}
   */
  getContext(): any {
    return {
      pageId: this.pageId,
      pages: this.pages,
      options: this.options,
    };
  }
}

export abstract class CustomPage {
  static readonly pageId: string;
  ui?: PagedActionForm;

  abstract getButton(event: PagedActionFormEvent): ActionButton;
  abstract show(event: PagedActionFormEvent): void;
}

// /**
//  * Custom page for searching the book.
//  */
// export class SearchPage extends CustomPage {
//   static readonly pageId = AddonUtils.makeId("search");

//   ctx?: InfoBookComponent;
//   options: SearchOptions = {};

//   #f(text: string): string {
//     return text.toLowerCase().replace(/[_]/g, " ");
//   }

//   search(data: FormResult): PageButton[] {
//     const q = data.query?.toString().toLowerCase();
//     if (!q) return [];
//     const results = [];

//     const pages = this.ctx?.pages;

//     for (const pageId in pages) {
//       const page = deepCopy(pages[pageId]);
//       if (page.hidden != undefined && page.hidden) continue;

//       if (page.body && page.body.toString().toLowerCase().includes(q)) {
//         results.push({
//           label: TextUtils.highlightQuery(q, page.body.toString()),
//           pageId: pageId,
//         });
//       }

//       if (data.include_titles && page.title) {
//         if (this.#f(page.title.toString()).includes(q)) {
//           results.push({
//             label: TextUtils.highlightQuery(q, page.title.toString()),
//             pageId: pageId,
//           });
//         }
//       }

//       if (data.include_buttons && page.buttons) {
//         for (const btn of page.buttons) {
//           if (typeof btn === "string") continue;
//           if (this.#f(btn.label.toString()).includes(q)) {
//             btn.label = TextUtils.highlightQuery(q, btn.label.toString());
//             results.push(btn);
//           }
//         }
//       }
//     }

//     return results;
//   }

//   #searchResultsPage(event: InfoBookEvent, formEvent: ModalFormOnSubmit): void {
//     const result = formEvent.formResult;
//     const namespace = Identifier.parse(event.itemStack).namespace;
//     const buttons = this.search(result);
//     const btns: ActionButton[] = buttons;
//     for (let i = 0; i < buttons.length; i++) {
//       btns[i].onClick = () => {
//         const showEvent = InfoBookEvent.withPage(event, buttons[i].pageId);
//         this.ctx?.show(showEvent);
//       };
//     }
//     const form: ActionForm = {
//       title: this.options.result_title ?? `#guide.${namespace}:search.results`,
//       body: (this.options.result_body ?? `Results for "{QUERY}"`).replace("{QUERY}", result.query as string),
//       buttons: buttons,
//     };
//     const ui = new ActionFormHandler(form);
//     ui.show(event.player);
//   }

//   #searchPage(event: InfoBookEvent): void {
//     const form: ModalForm = {
//       title: event.ctx.t(event, this.options.title ?? "#search"),
//       options: {
//         query: {
//           type: "text",
//           label: event.ctx.t(event, this.options.body ?? "#search.desc"),
//         },
//         include_titles: {
//           type: "toggle",
//           label: event.ctx.t(event, this.options.include_titles_label ?? "#search.include_titles"),
//           condition: () => this.options.include_titles ?? true,
//         },
//         include_buttons: {
//           type: "toggle",
//           label: event.ctx.t(event, this.options.include_buttons_label ?? "#search.include_buttons"),
//           condition: () => this.options.include_buttons ?? true,
//         },
//       },
//       submitLabel: `controller.buttonTip.enterSearch`,
//       onSubmit: (formEvent) => {
//         this.#searchResultsPage(event, formEvent);
//       },
//     };
//     const ui = new ModalFormHandler(form);
//     ui.show(event.player);
//   }

//   getButton(event: InfoBookEvent): PageButton {
//     return {
//       label: "controller.buttonTip.enterSearch",
//       icon: "textures/ui/magnifyingGlass.png",
//       onClick: (clickEvent) => {
//         this.show(event);
//       },
//     };
//   }

//   show(event: InfoBookEvent): void {
//     this.options = event.options["mcutils:search"] ?? {};
//     this.#searchPage(event);
//   }
// }

export class PagedActionForm {
  private static lastId: number;
  readonly id: string;
  readonly pages: Pages;
  customPages = new Map<string, CustomPage>();

  constructor(pages?: Pages, id?: string) {
    this.id = id ?? (PagedActionForm.lastId++).toString();
    this.pages = pages ?? {};
  }

  private convert(page: PageData, event: PagedActionFormEvent): ActionForm {
    const form = page as ActionForm;
    if (page.title) {
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
          btn = { label: page.title ?? "", pageId: btn };
        }

        form.buttons[i].label = this.t(event, btn.label);

        if (!btn.pageId) continue;

        form.buttons[i].onClick = (w: ActionFormEvent) => {
          this.show(event.player, btn.pageId, event.options, event.ctx);
        };
      }
    }

    return form;
  }

  t(event: PagedActionFormEvent, key: string | RawMessage): string | RawMessage {
    return key;
  }

  /**
   * Add a custom page.
   * @param {string} identifier
   * @param {CustomPage} page
   * @returns {PagedActionForm}
   */
  customPage(identifier: string, page: CustomPage): PagedActionForm {
    this.customPages.set(identifier, page);
    page.ui = this;
    return this;
  }

  isDefault(event: PagedActionFormEvent): boolean {
    return (event.options.default ?? "home") === event.pageId;
  }

  getHistory(player: Player): string[] {
    return JSON.parse((player.getDynamicProperty(this.id + ".history") as string) ?? "[]");
  }

  setHistory(player: Player, history: string[]): void {
    player.setDynamicProperty(this.id + ".history", JSON.stringify(history));
  }

  clearHistory(player: Player): void {
    this.setHistory(player, []);
  }

  isPageValid(pageId: string): boolean {
    try {
      this.validatePage(pageId);
      return true;
    } catch (e) {}
    return false;
  }

  hasPage(pageId: string): boolean {
    return this.customPages.has(pageId) || this.pages[pageId] !== undefined;
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
            errors.push({
              path: `${pageId}.buttons[${i}]`,
              message: `Page "${button}" does not exist.`,
            });
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
          ValidationError.optionalValueError(errors, `${pageId}.buttons[${i}].top_margin`, button.top_margin, [
            "number",
          ]);
          ValidationError.optionalValueError(errors, `${pageId}.buttons[${i}].bottom_margin`, button.bottom_margin, [
            "number",
          ]);
          ValidationError.optionalValueError(errors, `${pageId}.buttons[${i}].top_divider`, button.top_divider, [
            "boolean",
          ]);
          ValidationError.optionalValueError(errors, `${pageId}.buttons[${i}].bottom_divider`, button.bottom_divider, [
            "boolean",
          ]);
          ValidationError.optionalValueError(errors, `${pageId}.buttons[${i}].onClick`, button.onClick, ["function"]);
          ValidationError.optionalValueError(errors, `${pageId}.buttons[${i}].condition`, button.condition, [
            "function",
          ]);

          if (button.pageId && !ignorePages.includes(button.pageId)) {
            if (!this.hasPage(button.pageId)) {
              errors.push({
                path: `${pageId}.buttons[${i}].pageId`,
                message: `Page "${button.pageId}" does not exist.`,
              });
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

  show(player: Player, pageId?: string, options?: PagedActionFormOptions, ctx?: any): void {
    const event = new PagedActionFormEvent(player, this.pages, pageId, options, ctx);
    const history = this.getHistory(player);
    history.push(event.pageId);
    this.setHistory(player, history);
    if (this.customPages.has(event.pageId)) return this.customPages.get(event.pageId)?.show(event);

    const page = deepCopy(this.pages[event.pageId]);
    const form = this.convert(page, event);

    // Add back button.
    if (event.options.back_button != undefined && !this.isDefault(event)) {
      if (!form.buttons) form.buttons = [];
      form.buttons.push({
        label: event.options.back_button.label ?? "#gui.back",
        icon: event.options.back_button.icon ?? "textures/ui/arrowLeft.png",
        top_margin: event.options.back_button.top_margin ?? 1,
        bottom_margin: event.options.back_button.bottom_margin,
        top_divider: event.options.back_button.top_divider ?? true,
        bottom_divider: event.options.back_button.bottom_divider,
        onClick: () => {
          const end = history.length - 2;
          const page = history[end];
          history.splice(end, 2);
          this.setHistory(player, history);
          this.show(player, page, options, ctx);
        },
      });
    }

    // Add back button.
    const ui = new ActionFormHandler(form);
    ui.show(event.player, { ...event.getContext(), ...ctx });
  }

  showAll(pageId?: string, options?: PagedActionFormOptions, ctx?: any): void {
    world.getAllPlayers().forEach((player) => this.show(player, pageId, options, ctx));
  }
}
